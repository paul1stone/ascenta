/**
 * Workflow Engine
 * Core execution orchestrator for workflow operations
 */

import { db } from "@/lib/db";
import {
  workflowDefinitions,
  workflowRuns,
  workflowOutputs,
  intakeFields,
  guardrails as guardrailsTable,
  artifactTemplates,
  guidedActions,
  textLibraries,
} from "@/lib/db/workflow-schema";
import { eq, and, desc } from "drizzle-orm";
import { evaluateGuardrails, canProceed } from "./guardrails";
import { generateArtifact, createArtifactVersion } from "./artifacts";
import {
  logWorkflowCreated,
  logWorkflowUpdated,
  logGuardrailTriggered,
  logGuardrailOverridden,
  logArtifactGenerated,
  logReviewed,
  logExported,
  logCancelled,
  generateInputHash,
} from "./audit";
import type {
  WorkflowDefinitionConfig,
  WorkflowRunState,
  WorkflowInputs,
  WorkflowStatus,
  GuardrailDefinition,
  GuardrailEvaluationResult,
  IntakeFieldDefinition,
  ArtifactTemplateDefinition,
  GuidedActionDefinition,
  GeneratedArtifact,
  TextLibraryEntry,
  WorkflowListItem,
  WorkflowDetail,
} from "./types";

// ============================================================================
// WORKFLOW REGISTRY
// ============================================================================

// In-memory registry for code-defined workflows
const workflowRegistry = new Map<string, WorkflowDefinitionConfig>();

/**
 * Register a workflow definition (from code)
 */
export function registerWorkflow(config: WorkflowDefinitionConfig): void {
  workflowRegistry.set(config.slug, config);
}

/**
 * Get a registered workflow by slug
 */
export function getRegisteredWorkflow(
  slug: string
): WorkflowDefinitionConfig | undefined {
  return workflowRegistry.get(slug);
}

/**
 * Get all registered workflows
 */
export function getAllRegisteredWorkflows(): WorkflowDefinitionConfig[] {
  return Array.from(workflowRegistry.values());
}

// ============================================================================
// DATABASE SYNC
// ============================================================================

/**
 * Sync a code-defined workflow to the database
 * This ensures the database has the latest version
 */
export async function syncWorkflowToDatabase(
  config: WorkflowDefinitionConfig
): Promise<string> {
  // Check if workflow exists
  const existing = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.slug, config.slug))
    .limit(1);

  let workflowId: string;

  if (existing.length > 0) {
    // Update existing workflow
    const [updated] = await db
      .update(workflowDefinitions)
      .set({
        name: config.name,
        description: config.description,
        category: config.category,
        audience: config.audience,
        riskLevel: config.riskLevel,
        estimatedMinutes: config.estimatedMinutes,
        metadata: { icon: config.icon, ...config.metadata },
        version: existing[0].version + 1,
        updatedAt: new Date(),
      })
      .where(eq(workflowDefinitions.id, existing[0].id))
      .returning();
    workflowId = updated.id;

    // Clear existing related data (will be recreated)
    await Promise.all([
      db.delete(intakeFields).where(eq(intakeFields.workflowDefinitionId, workflowId)),
      db.delete(guardrailsTable).where(eq(guardrailsTable.workflowDefinitionId, workflowId)),
      db.delete(artifactTemplates).where(eq(artifactTemplates.workflowDefinitionId, workflowId)),
      db.delete(guidedActions).where(eq(guidedActions.workflowDefinitionId, workflowId)),
    ]);
  } else {
    // Create new workflow
    const [created] = await db
      .insert(workflowDefinitions)
      .values({
        slug: config.slug,
        name: config.name,
        description: config.description,
        category: config.category,
        audience: config.audience,
        riskLevel: config.riskLevel,
        estimatedMinutes: config.estimatedMinutes,
        metadata: { icon: config.icon, ...config.metadata },
      })
      .returning();
    workflowId = created.id;
  }

  // Insert intake fields
  if (config.intakeFields.length > 0) {
    await db.insert(intakeFields).values(
      config.intakeFields.map((field) => ({
        workflowDefinitionId: workflowId,
        fieldKey: field.fieldKey,
        label: field.label,
        type: field.type,
        placeholder: field.placeholder,
        helpText: field.helpText,
        required: field.required,
        validationRules: field.validationRules,
        options: field.options,
        sortOrder: field.sortOrder,
        groupName: field.groupName,
        conditionalOn: field.conditionalOn,
      }))
    );
  }

  // Insert guardrails
  if (config.guardrails.length > 0) {
    await db.insert(guardrailsTable).values(
      config.guardrails.map((g) => ({
        workflowDefinitionId: workflowId,
        name: g.name,
        description: g.description,
        triggerCondition: g.triggerCondition,
        severity: g.severity,
        message: g.message,
        requiredAction: g.requiredAction,
        escalateTo: g.escalateTo,
        sortOrder: g.sortOrder,
        isActive: g.isActive,
      }))
    );
  }

  // Insert artifact templates
  if (config.artifactTemplates.length > 0) {
    await db.insert(artifactTemplates).values(
      config.artifactTemplates.map((t) => ({
        workflowDefinitionId: workflowId,
        name: t.name,
        type: t.type,
        sections: t.sections,
        exportFormats: t.exportFormats,
        metadata: t.metadata,
      }))
    );
  }

  // Insert guided actions
  if (config.guidedActions.length > 0) {
    await db.insert(guidedActions).values(
      config.guidedActions.map((a) => ({
        workflowDefinitionId: workflowId,
        label: a.label,
        description: a.description,
        icon: a.icon,
        requiredInputs: a.requiredInputs,
        outputType: a.outputType,
        outputTarget: a.outputTarget,
        promptTemplate: a.promptTemplate,
        sortOrder: a.sortOrder,
        isActive: a.isActive,
      }))
    );
  }

  // Insert text library entries
  if (config.textLibraryEntries && config.textLibraryEntries.length > 0) {
    await db.insert(textLibraries).values(
      config.textLibraryEntries.map((t) => ({
        category: t.category,
        key: t.key,
        title: t.title,
        content: t.content,
        workflowDefinitionId: workflowId,
        metadata: t.metadata,
      }))
    );
  }

  return workflowId;
}

/**
 * Sync all registered workflows to the database
 */
export async function syncAllWorkflowsToDatabase(): Promise<void> {
  const workflows = getAllRegisteredWorkflows();
  for (const config of workflows) {
    await syncWorkflowToDatabase(config);
  }
}

// ============================================================================
// WORKFLOW RETRIEVAL
// ============================================================================

/**
 * Get all available workflows (list view)
 */
export async function listWorkflows(): Promise<WorkflowListItem[]> {
  const workflows = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.isActive, true))
    .orderBy(workflowDefinitions.name);

  return workflows.map((w) => ({
    id: w.id,
    slug: w.slug,
    name: w.name,
    description: w.description ?? undefined,
    category: w.category as WorkflowListItem["category"],
    audience: w.audience as WorkflowListItem["audience"],
    riskLevel: w.riskLevel as WorkflowListItem["riskLevel"],
    estimatedMinutes: w.estimatedMinutes ?? undefined,
    icon: (w.metadata as Record<string, unknown>)?.icon as string | undefined,
  }));
}

/**
 * Get workflow detail by slug
 */
export async function getWorkflowBySlug(slug: string): Promise<WorkflowDetail | null> {
  const [workflow] = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.slug, slug))
    .limit(1);

  if (!workflow) {
    return null;
  }

  // Fetch related data
  const [fields, rails, templates, actions] = await Promise.all([
    db
      .select()
      .from(intakeFields)
      .where(eq(intakeFields.workflowDefinitionId, workflow.id))
      .orderBy(intakeFields.sortOrder),
    db
      .select()
      .from(guardrailsTable)
      .where(eq(guardrailsTable.workflowDefinitionId, workflow.id))
      .orderBy(guardrailsTable.sortOrder),
    db
      .select()
      .from(artifactTemplates)
      .where(eq(artifactTemplates.workflowDefinitionId, workflow.id)),
    db
      .select()
      .from(guidedActions)
      .where(eq(guidedActions.workflowDefinitionId, workflow.id))
      .orderBy(guidedActions.sortOrder),
  ]);

  return {
    id: workflow.id,
    slug: workflow.slug,
    name: workflow.name,
    description: workflow.description ?? undefined,
    category: workflow.category as WorkflowDetail["category"],
    audience: workflow.audience as WorkflowDetail["audience"],
    riskLevel: workflow.riskLevel as WorkflowDetail["riskLevel"],
    estimatedMinutes: workflow.estimatedMinutes ?? undefined,
    icon: (workflow.metadata as Record<string, unknown>)?.icon as string | undefined,
    intakeFields: fields.map((f) => ({
      fieldKey: f.fieldKey,
      label: f.label,
      type: f.type as IntakeFieldDefinition["type"],
      placeholder: f.placeholder ?? undefined,
      helpText: f.helpText ?? undefined,
      required: f.required,
      validationRules: f.validationRules as IntakeFieldDefinition["validationRules"],
      options: f.options as IntakeFieldDefinition["options"],
      sortOrder: f.sortOrder,
      groupName: f.groupName ?? undefined,
      conditionalOn: f.conditionalOn as IntakeFieldDefinition["conditionalOn"],
    })),
    guardrails: rails.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description ?? undefined,
      triggerCondition: g.triggerCondition as GuardrailDefinition["triggerCondition"],
      severity: g.severity as GuardrailDefinition["severity"],
      message: g.message,
      requiredAction: g.requiredAction as GuardrailDefinition["requiredAction"],
      escalateTo: g.escalateTo ?? undefined,
      sortOrder: g.sortOrder,
      isActive: g.isActive,
    })),
    artifactTemplates: templates.map((t) => ({
      id: t.id,
      name: t.name,
      type: t.type as ArtifactTemplateDefinition["type"],
      sections: t.sections as ArtifactTemplateDefinition["sections"],
      exportFormats: t.exportFormats as ArtifactTemplateDefinition["exportFormats"],
      metadata: t.metadata as ArtifactTemplateDefinition["metadata"],
    })),
    guidedActions: actions.map((a) => ({
      id: a.id,
      label: a.label,
      description: a.description ?? undefined,
      icon: a.icon ?? undefined,
      requiredInputs: a.requiredInputs as GuidedActionDefinition["requiredInputs"],
      outputType: a.outputType as GuidedActionDefinition["outputType"],
      outputTarget: a.outputTarget ?? undefined,
      promptTemplate: a.promptTemplate,
      sortOrder: a.sortOrder,
      isActive: a.isActive,
    })),
  };
}

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

/**
 * Start a new workflow run
 */
export async function startWorkflowRun(
  workflowSlug: string,
  userId: string,
  initialInputs: WorkflowInputs = {}
): Promise<WorkflowRunState> {
  const workflow = await getWorkflowBySlug(workflowSlug);
  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowSlug}`);
  }

  // Get the current version
  const [def] = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.slug, workflowSlug))
    .limit(1);

  // Create the run
  const [run] = await db
    .insert(workflowRuns)
    .values({
      workflowDefinitionId: def.id,
      workflowVersion: def.version,
      userId,
      inputsSnapshot: initialInputs,
      status: "intake",
      currentStep: "intake",
    })
    .returning();

  // Log the creation
  await logWorkflowCreated(run.id, userId, def.version, initialInputs);

  return {
    id: run.id,
    workflowSlug,
    workflowVersion: def.version,
    userId,
    status: "intake",
    currentStep: "intake",
    inputs: initialInputs,
    rationales: {},
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
  };
}

/**
 * Get workflow run by ID
 */
export async function getWorkflowRun(runId: string): Promise<WorkflowRunState | null> {
  const [run] = await db
    .select()
    .from(workflowRuns)
    .where(eq(workflowRuns.id, runId))
    .limit(1);

  if (!run) {
    return null;
  }

  // Get the workflow slug
  const [def] = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.id, run.workflowDefinitionId))
    .limit(1);

  // Get the latest output if any
  const [output] = await db
    .select()
    .from(workflowOutputs)
    .where(eq(workflowOutputs.workflowRunId, runId))
    .orderBy(desc(workflowOutputs.version))
    .limit(1);

  return {
    id: run.id,
    workflowSlug: def.slug,
    workflowVersion: run.workflowVersion,
    userId: run.userId,
    status: run.status as WorkflowStatus,
    currentStep: run.currentStep as WorkflowStatus,
    inputs: run.inputsSnapshot as WorkflowInputs,
    guardrailResults: run.guardrailsTriggered as GuardrailEvaluationResult | undefined,
    rationales: {}, // Would need to be stored separately or in inputs
    generatedArtifact: output
      ? {
          templateId: output.artifactTemplateId ?? "",
          version: output.version,
          sections: output.content as Record<string, string>,
          renderedContent: output.renderedContent ?? "",
          contentHash: output.contentHash ?? "",
          generatedAt: output.createdAt,
        }
      : undefined,
    reviewerId: run.reviewerId ?? undefined,
    reviewedAt: run.reviewedAt ?? undefined,
    reviewNotes: run.reviewNotes ?? undefined,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    completedAt: run.completedAt ?? undefined,
  };
}

/**
 * Update workflow run inputs and evaluate guardrails
 */
export async function updateWorkflowRun(
  runId: string,
  userId: string,
  updates: {
    inputs?: Partial<WorkflowInputs>;
    rationales?: Record<string, string>;
  }
): Promise<{
  runState: WorkflowRunState;
  guardrailResults: GuardrailEvaluationResult;
  canProceed: boolean;
}> {
  const run = await getWorkflowRun(runId);
  if (!run) {
    throw new Error(`Workflow run not found: ${runId}`);
  }

  const workflow = await getWorkflowBySlug(run.workflowSlug);
  if (!workflow) {
    throw new Error(`Workflow not found: ${run.workflowSlug}`);
  }

  // Merge inputs
  const newInputs = {
    ...run.inputs,
    ...updates.inputs,
  };

  // Track which fields were updated
  const updatedFields = Object.keys(updates.inputs || {});

  // Update the run
  await db
    .update(workflowRuns)
    .set({
      inputsSnapshot: newInputs,
      updatedAt: new Date(),
    })
    .where(eq(workflowRuns.id, runId));

  // Log the update
  if (updatedFields.length > 0) {
    await logWorkflowUpdated(runId, userId, run.workflowVersion, newInputs, updatedFields);
  }

  // Evaluate guardrails
  const guardrailResults = evaluateGuardrails(
    workflow.guardrails,
    newInputs,
    updates.rationales
  );

  // Log triggered guardrails
  for (const result of guardrailResults.results) {
    if (!result.passed) {
      await logGuardrailTriggered(
        runId,
        "system",
        run.workflowVersion,
        result.guardrailId,
        result.name,
        result.severity,
        result.message
      );

      // Log overrides with rationale
      if (result.rationaleProvided && updates.rationales?.[result.guardrailId]) {
        await logGuardrailOverridden(
          runId,
          userId,
          run.workflowVersion,
          result.guardrailId,
          result.name,
          updates.rationales[result.guardrailId]
        );
      }
    }
  }

  // Store guardrail results
  await db
    .update(workflowRuns)
    .set({
      guardrailsTriggered: guardrailResults,
    })
    .where(eq(workflowRuns.id, runId));

  const updatedRun = await getWorkflowRun(runId);

  return {
    runState: updatedRun!,
    guardrailResults,
    canProceed: canProceed(guardrailResults),
  };
}

/**
 * Generate artifact for a workflow run
 */
export async function generateWorkflowArtifact(
  runId: string,
  userId: string,
  templateId?: string,
  customPrompts?: Record<string, string>
): Promise<GeneratedArtifact> {
  const run = await getWorkflowRun(runId);
  if (!run) {
    throw new Error(`Workflow run not found: ${runId}`);
  }

  const workflow = await getWorkflowBySlug(run.workflowSlug);
  if (!workflow) {
    throw new Error(`Workflow not found: ${run.workflowSlug}`);
  }

  // Get the template
  const template = templateId
    ? workflow.artifactTemplates.find((t) => t.id === templateId)
    : workflow.artifactTemplates[0];

  if (!template) {
    throw new Error("No artifact template found");
  }

  // Get text library entries
  const [def] = await db
    .select()
    .from(workflowDefinitions)
    .where(eq(workflowDefinitions.slug, run.workflowSlug))
    .limit(1);

  const textLibraryEntries = await db
    .select()
    .from(textLibraries)
    .where(eq(textLibraries.workflowDefinitionId, def.id));

  const textLibrary: TextLibraryEntry[] = textLibraryEntries.map((t) => ({
    category: t.category as TextLibraryEntry["category"],
    key: t.key,
    title: t.title,
    content: t.content,
    metadata: t.metadata as Record<string, unknown> | undefined,
  }));

  // Update status
  await db
    .update(workflowRuns)
    .set({
      status: "generating",
      currentStep: "generating",
      updatedAt: new Date(),
    })
    .where(eq(workflowRuns.id, runId));

  // Enrich inputs with auto-generated values
  const enrichedInputs = {
    ...run.inputs,
    currentDate: new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }),
  };

  // Generate the artifact
  const artifact = await generateArtifact(template, enrichedInputs, textLibrary, {
    customPrompts,
  });

  // Store the output
  await db.insert(workflowOutputs).values({
    workflowRunId: runId,
    artifactTemplateId: template.id,
    version: artifact.version,
    content: artifact.sections,
    renderedContent: artifact.renderedContent,
    contentHash: artifact.contentHash,
  });

  // Log the generation
  await logArtifactGenerated(runId, userId, run.workflowVersion, artifact);

  // Update status to review
  await db
    .update(workflowRuns)
    .set({
      status: "review",
      currentStep: "review",
      updatedAt: new Date(),
    })
    .where(eq(workflowRuns.id, runId));

  return artifact;
}

/**
 * Approve and export workflow artifact
 */
export async function exportWorkflowArtifact(
  runId: string,
  userId: string,
  format: "pdf" | "docx",
  confirmations: {
    accuracyReviewed: boolean;
    noPHI: boolean;
    policyReferencesCorrect: boolean;
  },
  reviewNotes?: string
): Promise<{ exportUrl: string; exportedAt: Date }> {
  const run = await getWorkflowRun(runId);
  if (!run) {
    throw new Error(`Workflow run not found: ${runId}`);
  }

  if (!run.generatedArtifact) {
    throw new Error("No artifact to export");
  }

  // Verify all confirmations
  if (
    !confirmations.accuracyReviewed ||
    !confirmations.noPHI ||
    !confirmations.policyReferencesCorrect
  ) {
    throw new Error("All review confirmations must be checked before export");
  }

  // Log the review/approval
  await logReviewed(runId, userId, run.workflowVersion, true, reviewNotes);

  // TODO: This URL doesn't resolve to a real route — implement download endpoint or remove
  const exportUrl = `/api/workflows/runs/${runId}/download/${format}`;
  const exportedAt = new Date();

  // Update the output record
  await db
    .update(workflowOutputs)
    .set({
      exportedAt,
      exportFormat: format,
      exportUrl,
    })
    .where(
      and(
        eq(workflowOutputs.workflowRunId, runId),
        eq(workflowOutputs.version, run.generatedArtifact.version)
      )
    );

  // Log the export
  await logExported(
    runId,
    userId,
    run.workflowVersion,
    format,
    run.generatedArtifact.contentHash,
    confirmations
  );

  // Update run status
  await db
    .update(workflowRuns)
    .set({
      status: "completed",
      currentStep: "completed",
      reviewerId: userId,
      reviewedAt: exportedAt,
      reviewNotes,
      completedAt: exportedAt,
      updatedAt: exportedAt,
    })
    .where(eq(workflowRuns.id, runId));

  return { exportUrl, exportedAt };
}

/**
 * Cancel a workflow run
 */
export async function cancelWorkflowRun(
  runId: string,
  userId: string,
  reason?: string
): Promise<void> {
  const run = await getWorkflowRun(runId);
  if (!run) {
    throw new Error(`Workflow run not found: ${runId}`);
  }

  // Log the cancellation
  await logCancelled(runId, userId, run.workflowVersion, reason);

  // Update the run
  await db
    .update(workflowRuns)
    .set({
      status: "cancelled",
      currentStep: "cancelled",
      updatedAt: new Date(),
    })
    .where(eq(workflowRuns.id, runId));
}

/**
 * Get all runs for a user
 */
export async function getUserWorkflowRuns(
  userId: string,
  options?: {
    status?: WorkflowStatus;
    limit?: number;
    offset?: number;
  }
): Promise<WorkflowRunState[]> {
  let query = db
    .select()
    .from(workflowRuns)
    .where(eq(workflowRuns.userId, userId))
    .orderBy(desc(workflowRuns.updatedAt));

  if (options?.status) {
    query = db
      .select()
      .from(workflowRuns)
      .where(
        and(
          eq(workflowRuns.userId, userId),
          eq(workflowRuns.status, options.status)
        )
      )
      .orderBy(desc(workflowRuns.updatedAt));
  }

  if (options?.limit) {
    query = query.limit(options.limit) as typeof query;
  }

  if (options?.offset) {
    query = query.offset(options.offset) as typeof query;
  }

  const runs = await query;

  // Get workflow slugs for all runs
  const workflowIds = [...new Set(runs.map((r) => r.workflowDefinitionId))];
  const workflows = await db
    .select()
    .from(workflowDefinitions)
    .where(
      workflowIds.length > 0
        ? eq(workflowDefinitions.id, workflowIds[0]) // Simplified - would need better query
        : undefined
    );

  const workflowMap = new Map(workflows.map((w) => [w.id, w.slug]));

  return runs.map((run) => ({
    id: run.id,
    workflowSlug: workflowMap.get(run.workflowDefinitionId) ?? "",
    workflowVersion: run.workflowVersion,
    userId: run.userId,
    status: run.status as WorkflowStatus,
    currentStep: run.currentStep as WorkflowStatus,
    inputs: run.inputsSnapshot as WorkflowInputs,
    guardrailResults: run.guardrailsTriggered as GuardrailEvaluationResult | undefined,
    rationales: {},
    reviewerId: run.reviewerId ?? undefined,
    reviewedAt: run.reviewedAt ?? undefined,
    reviewNotes: run.reviewNotes ?? undefined,
    createdAt: run.createdAt,
    updatedAt: run.updatedAt,
    completedAt: run.completedAt ?? undefined,
  }));
}
