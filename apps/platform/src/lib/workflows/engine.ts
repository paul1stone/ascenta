/**
 * Workflow Engine
 * Core execution orchestrator for workflow operations
 */

import { connectDB } from "@ascenta/db";
import {
  WorkflowDefinition,
  WorkflowRun,
  WorkflowOutput,
} from "@ascenta/db/workflow-schema";
import { evaluateGuardrails, canProceed } from "./guardrails";
import { generateArtifact } from "./artifacts";
import {
  logWorkflowCreated,
  logWorkflowUpdated,
  logGuardrailTriggered,
  logGuardrailOverridden,
  logArtifactGenerated,
  logReviewed,
  logExported,
  logCancelled,
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
 * Sync a code-defined workflow to the database.
 * Single findOneAndUpdate with upsert replaces the multi-table delete/insert pattern.
 */
export async function syncWorkflowToDatabase(
  config: WorkflowDefinitionConfig
): Promise<string> {
  await connectDB();

  const result = await WorkflowDefinition.findOneAndUpdate(
    { slug: config.slug },
    {
      $set: {
        name: config.name,
        description: config.description,
        category: config.category,
        audience: config.audience,
        riskLevel: config.riskLevel,
        estimatedMinutes: config.estimatedMinutes,
        metadata: { icon: config.icon, ...config.metadata },
        isActive: true,
        // Embedded sub-documents — replaced atomically
        intakeFields: config.intakeFields.map((field) => ({
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
        })),
        guardrails: config.guardrails.map((g) => ({
          name: g.name,
          description: g.description,
          triggerCondition: g.triggerCondition,
          severity: g.severity,
          message: g.message,
          requiredAction: g.requiredAction,
          escalateTo: g.escalateTo,
          sortOrder: g.sortOrder,
          isActive: g.isActive,
        })),
        artifactTemplates: config.artifactTemplates.map((t) => ({
          name: t.name,
          type: t.type,
          sections: t.sections,
          exportFormats: t.exportFormats,
          metadata: t.metadata,
        })),
        guidedActions: config.guidedActions.map((a) => ({
          label: a.label,
          description: a.description,
          icon: a.icon,
          requiredInputs: a.requiredInputs,
          outputType: a.outputType,
          outputTarget: a.outputTarget,
          promptTemplate: a.promptTemplate,
          sortOrder: a.sortOrder,
          isActive: a.isActive,
        })),
        textLibraries: (config.textLibraryEntries ?? []).map((t) => ({
          category: t.category,
          key: t.key,
          title: t.title,
          content: t.content,
          metadata: t.metadata,
        })),
      },
      $inc: { version: 1 },
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  return String(result._id);
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
  await connectDB();
  const workflows = await WorkflowDefinition.find({ isActive: true }).sort({ name: 1 });

  return workflows.map((w) => {
    const obj = w.toJSON() as Record<string, unknown>;
    return {
      id: obj.id as string,
      slug: obj.slug as string,
      name: obj.name as string,
      description: (obj.description as string) ?? undefined,
      category: obj.category as WorkflowListItem["category"],
      audience: obj.audience as WorkflowListItem["audience"],
      riskLevel: obj.riskLevel as WorkflowListItem["riskLevel"],
      estimatedMinutes: (obj.estimatedMinutes as number) ?? undefined,
      icon: (obj.metadata as Record<string, unknown>)?.icon as string | undefined,
    };
  });
}

/**
 * Get workflow detail by slug.
 * Single query — all sub-docs are embedded in the document.
 */
export async function getWorkflowBySlug(slug: string): Promise<WorkflowDetail | null> {
  await connectDB();
  const workflow = await WorkflowDefinition.findOne({ slug });
  if (!workflow) return null;

  const obj = workflow.toJSON() as Record<string, unknown>;
  const fields = (obj.intakeFields ?? []) as Record<string, unknown>[];
  const rails = (obj.guardrails ?? []) as Record<string, unknown>[];
  const templates = (obj.artifactTemplates ?? []) as Record<string, unknown>[];
  const actions = (obj.guidedActions ?? []) as Record<string, unknown>[];

  return {
    id: obj.id as string,
    slug: obj.slug as string,
    name: obj.name as string,
    description: (obj.description as string) ?? undefined,
    category: obj.category as WorkflowDetail["category"],
    audience: obj.audience as WorkflowDetail["audience"],
    riskLevel: obj.riskLevel as WorkflowDetail["riskLevel"],
    estimatedMinutes: (obj.estimatedMinutes as number) ?? undefined,
    icon: (obj.metadata as Record<string, unknown>)?.icon as string | undefined,
    intakeFields: fields.map((f) => ({
      fieldKey: f.fieldKey as string,
      label: f.label as string,
      type: f.type as IntakeFieldDefinition["type"],
      placeholder: (f.placeholder as string) ?? undefined,
      helpText: (f.helpText as string) ?? undefined,
      required: f.required as boolean,
      validationRules: f.validationRules as IntakeFieldDefinition["validationRules"],
      options: f.options as IntakeFieldDefinition["options"],
      sortOrder: f.sortOrder as number,
      groupName: (f.groupName as string) ?? undefined,
      conditionalOn: f.conditionalOn as IntakeFieldDefinition["conditionalOn"],
    })),
    guardrails: rails.map((g) => ({
      id: g.id as string,
      name: g.name as string,
      description: (g.description as string) ?? undefined,
      triggerCondition: g.triggerCondition as GuardrailDefinition["triggerCondition"],
      severity: g.severity as GuardrailDefinition["severity"],
      message: g.message as string,
      requiredAction: g.requiredAction as GuardrailDefinition["requiredAction"],
      escalateTo: (g.escalateTo as string) ?? undefined,
      sortOrder: g.sortOrder as number,
      isActive: g.isActive as boolean,
    })),
    artifactTemplates: templates.map((t) => ({
      id: t.id as string,
      name: t.name as string,
      type: t.type as ArtifactTemplateDefinition["type"],
      sections: t.sections as ArtifactTemplateDefinition["sections"],
      exportFormats: t.exportFormats as ArtifactTemplateDefinition["exportFormats"],
      metadata: t.metadata as ArtifactTemplateDefinition["metadata"],
    })),
    guidedActions: actions.map((a) => ({
      id: a.id as string,
      label: a.label as string,
      description: (a.description as string) ?? undefined,
      icon: (a.icon as string) ?? undefined,
      requiredInputs: a.requiredInputs as GuidedActionDefinition["requiredInputs"],
      outputType: a.outputType as GuidedActionDefinition["outputType"],
      outputTarget: (a.outputTarget as string) ?? undefined,
      promptTemplate: a.promptTemplate as string,
      sortOrder: a.sortOrder as number,
      isActive: a.isActive as boolean,
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
  await connectDB();
  const workflow = await getWorkflowBySlug(workflowSlug);
  if (!workflow) {
    throw new Error(`Workflow not found: ${workflowSlug}`);
  }

  // Get the definition for version/id
  const def = await WorkflowDefinition.findOne({ slug: workflowSlug });
  if (!def) throw new Error(`Workflow definition not found: ${workflowSlug}`);
  const defObj = def.toJSON() as Record<string, unknown>;

  // Create the run
  const run = await WorkflowRun.create({
    workflowDefinitionId: def._id,
    workflowVersion: defObj.version as number,
    userId,
    inputsSnapshot: initialInputs,
    status: "intake",
    currentStep: "intake",
  });
  const runObj = run.toJSON() as Record<string, unknown>;

  // Log the creation
  await logWorkflowCreated(runObj.id as string, userId, defObj.version as number, initialInputs);

  return {
    id: runObj.id as string,
    workflowSlug,
    workflowVersion: defObj.version as number,
    userId,
    status: "intake",
    currentStep: "intake",
    inputs: initialInputs,
    rationales: {},
    createdAt: runObj.createdAt as Date,
    updatedAt: runObj.updatedAt as Date,
  };
}

/**
 * Get workflow run by ID
 */
export async function getWorkflowRun(runId: string): Promise<WorkflowRunState | null> {
  await connectDB();
  const run = await WorkflowRun.findById(runId);
  if (!run) return null;
  const runObj = run.toJSON() as Record<string, unknown>;

  // Get the workflow slug
  const def = await WorkflowDefinition.findById(run.workflowDefinitionId);
  if (!def) return null;
  const defObj = def.toJSON() as Record<string, unknown>;

  // Get the latest output if any
  const output = await WorkflowOutput.findOne({ workflowRunId: runId })
    .sort({ version: -1 });

  let generatedArtifact: WorkflowRunState["generatedArtifact"];
  if (output) {
    const outObj = output.toJSON() as Record<string, unknown>;
    generatedArtifact = {
      templateId: outObj.artifactTemplateId ? String(outObj.artifactTemplateId) : "",
      version: outObj.version as number,
      sections: outObj.content as Record<string, string>,
      renderedContent: (outObj.renderedContent as string) ?? "",
      contentHash: (outObj.contentHash as string) ?? "",
      generatedAt: outObj.createdAt as Date,
    };
  }

  return {
    id: runObj.id as string,
    workflowSlug: defObj.slug as string,
    workflowVersion: runObj.workflowVersion as number,
    userId: runObj.userId as string,
    status: runObj.status as WorkflowStatus,
    currentStep: runObj.currentStep as WorkflowStatus,
    inputs: runObj.inputsSnapshot as WorkflowInputs,
    guardrailResults: runObj.guardrailsTriggered as GuardrailEvaluationResult | undefined,
    rationales: {},
    generatedArtifact,
    reviewerId: (runObj.reviewerId as string) ?? undefined,
    reviewedAt: (runObj.reviewedAt as Date) ?? undefined,
    reviewNotes: (runObj.reviewNotes as string) ?? undefined,
    createdAt: runObj.createdAt as Date,
    updatedAt: runObj.updatedAt as Date,
    completedAt: (runObj.completedAt as Date) ?? undefined,
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
  await WorkflowRun.findByIdAndUpdate(runId, {
    $set: { inputsSnapshot: newInputs },
  });

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
  await WorkflowRun.findByIdAndUpdate(runId, {
    $set: { guardrailsTriggered: guardrailResults },
  });

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

  // Get text library entries from the definition's embedded textLibraries
  const def = await WorkflowDefinition.findOne({ slug: run.workflowSlug });
  const defObj = def?.toJSON() as Record<string, unknown> | undefined;
  const textLibraryDocs = ((defObj?.textLibraries ?? []) as Record<string, unknown>[]);

  const textLibrary: TextLibraryEntry[] = textLibraryDocs.map((t) => ({
    category: t.category as TextLibraryEntry["category"],
    key: t.key as string,
    title: t.title as string,
    content: t.content as string,
    metadata: t.metadata as Record<string, unknown> | undefined,
  }));

  // Update status
  await WorkflowRun.findByIdAndUpdate(runId, {
    $set: { status: "generating", currentStep: "generating" },
  });

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
  await WorkflowOutput.create({
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
  await WorkflowRun.findByIdAndUpdate(runId, {
    $set: { status: "review", currentStep: "review" },
  });

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

  const exportUrl = `/api/workflows/runs/${runId}/download/${format}`;
  const exportedAt = new Date();

  // Update the output record
  await WorkflowOutput.findOneAndUpdate(
    { workflowRunId: runId, version: run.generatedArtifact.version },
    { $set: { exportedAt, exportFormat: format, exportUrl } }
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
  await WorkflowRun.findByIdAndUpdate(runId, {
    $set: {
      status: "completed",
      currentStep: "completed",
      reviewerId: userId,
      reviewedAt: exportedAt,
      reviewNotes,
      completedAt: exportedAt,
    },
  });

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
  await WorkflowRun.findByIdAndUpdate(runId, {
    $set: { status: "cancelled", currentStep: "cancelled" },
  });
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
  await connectDB();

  const filter: Record<string, unknown> = { userId };
  if (options?.status) {
    filter.status = options.status;
  }

  let query = WorkflowRun.find(filter).sort({ updatedAt: -1 });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.skip(options.offset);
  }

  const runs = await query;

  // Get workflow slugs for all runs
  const workflowIds = [...new Set(runs.map((r) => String(r.workflowDefinitionId)))];
  const workflows = workflowIds.length > 0
    ? await WorkflowDefinition.find({ _id: { $in: workflowIds } })
    : [];

  const workflowMap = new Map(
    workflows.map((w) => [String(w._id), (w.toJSON() as Record<string, unknown>).slug as string])
  );

  return runs.map((run) => {
    const obj = run.toJSON() as Record<string, unknown>;
    return {
      id: obj.id as string,
      workflowSlug: workflowMap.get(String(run.workflowDefinitionId)) ?? "",
      workflowVersion: obj.workflowVersion as number,
      userId: obj.userId as string,
      status: obj.status as WorkflowStatus,
      currentStep: obj.currentStep as WorkflowStatus,
      inputs: obj.inputsSnapshot as WorkflowInputs,
      guardrailResults: obj.guardrailsTriggered as GuardrailEvaluationResult | undefined,
      rationales: {},
      reviewerId: (obj.reviewerId as string) ?? undefined,
      reviewedAt: (obj.reviewedAt as Date) ?? undefined,
      reviewNotes: (obj.reviewNotes as string) ?? undefined,
      createdAt: obj.createdAt as Date,
      updatedAt: obj.updatedAt as Date,
      completedAt: (obj.completedAt as Date) ?? undefined,
    };
  });
}
