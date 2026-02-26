/**
 * Audit Logger
 * Immutable audit event logging system for workflow execution
 */

import { createHash } from "crypto";
import { connectDB } from "@ascenta/db";
import { AuditEvent } from "@ascenta/db/workflow-schema";
import type {
  AuditEventData,
  AuditEventRecord,
  AuditAction,
  WorkflowInputs,
  GeneratedArtifact,
} from "./types";

// ============================================================================
// HASH GENERATION
// ============================================================================

/**
 * Generate a SHA-256 hash of the inputs for audit integrity
 */
export function generateInputHash(inputs: WorkflowInputs): string {
  const normalized = JSON.stringify(inputs, Object.keys(inputs).sort());
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Generate a SHA-256 hash of the output content
 */
export function generateOutputHash(output: unknown): string {
  const content = typeof output === "string" ? output : JSON.stringify(output);
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Verify that a hash matches the expected content
 */
export function verifyHash(content: unknown, expectedHash: string): boolean {
  const actualHash =
    typeof content === "string"
      ? createHash("sha256").update(content).digest("hex")
      : generateOutputHash(content);
  return actualHash === expectedHash;
}

// ============================================================================
// AUDIT EVENT CREATION
// ============================================================================

/**
 * Log an audit event
 */
export async function logAuditEvent(data: AuditEventData): Promise<AuditEventRecord> {
  await connectDB();
  const event = await AuditEvent.create({
    workflowRunId: data.workflowRunId,
    actorId: data.actorId,
    actorType: data.actorType,
    action: data.action,
    description: data.description,
    inputHash: data.inputHash,
    outputHash: data.outputHash,
    metadata: data.metadata,
    rationale: data.rationale,
    workflowVersion: data.workflowVersion,
  });

  const obj = event.toJSON() as Record<string, unknown>;
  return {
    ...data,
    id: obj.id as string,
    timestamp: obj.timestamp as Date,
  };
}

/**
 * Log a workflow creation event
 */
export async function logWorkflowCreated(
  workflowRunId: string,
  actorId: string,
  workflowVersion: number,
  inputs: WorkflowInputs
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId,
    actorType: "user",
    action: "created",
    description: "Workflow run started",
    inputHash: generateInputHash(inputs),
    workflowVersion,
    metadata: {
      initialInputs: Object.keys(inputs),
    },
  });
}

/**
 * Log a workflow update event
 */
export async function logWorkflowUpdated(
  workflowRunId: string,
  actorId: string,
  workflowVersion: number,
  inputs: WorkflowInputs,
  updatedFields: string[]
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId,
    actorType: "user",
    action: "updated",
    description: `Updated fields: ${updatedFields.join(", ")}`,
    inputHash: generateInputHash(inputs),
    workflowVersion,
    metadata: {
      updatedFields,
    },
  });
}

/**
 * Log a guardrail triggered event
 */
export async function logGuardrailTriggered(
  workflowRunId: string,
  actorId: string,
  workflowVersion: number,
  guardrailId: string,
  guardrailName: string,
  severity: string,
  message: string
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId,
    actorType: "system",
    action: "guardrail_triggered",
    description: `Guardrail "${guardrailName}" triggered with severity: ${severity}`,
    workflowVersion,
    metadata: {
      guardrailId,
      guardrailName,
      severity,
      message,
    },
  });
}

/**
 * Log a guardrail override event (when rationale is provided)
 */
export async function logGuardrailOverridden(
  workflowRunId: string,
  actorId: string,
  workflowVersion: number,
  guardrailId: string,
  guardrailName: string,
  rationale: string
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId,
    actorType: "user",
    action: "guardrail_overridden",
    description: `Guardrail "${guardrailName}" overridden with rationale`,
    rationale,
    workflowVersion,
    metadata: {
      guardrailId,
      guardrailName,
    },
  });
}

/**
 * Log an artifact generation event
 */
export async function logArtifactGenerated(
  workflowRunId: string,
  actorId: string,
  workflowVersion: number,
  artifact: GeneratedArtifact
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId,
    actorType: "system",
    action: "generated",
    description: `Artifact generated (version ${artifact.version})`,
    outputHash: artifact.contentHash,
    workflowVersion,
    metadata: {
      templateId: artifact.templateId,
      version: artifact.version,
      sections: Object.keys(artifact.sections),
    },
  });
}

/**
 * Log a review event
 */
export async function logReviewed(
  workflowRunId: string,
  reviewerId: string,
  workflowVersion: number,
  approved: boolean,
  notes?: string
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId: reviewerId,
    actorType: "user",
    action: approved ? "approved" : "reviewed",
    description: approved
      ? "Artifact approved for export"
      : "Artifact reviewed with feedback",
    workflowVersion,
    metadata: {
      approved,
      notes,
    },
  });
}

/**
 * Log an export event
 */
export async function logExported(
  workflowRunId: string,
  actorId: string,
  workflowVersion: number,
  format: "pdf" | "docx",
  outputHash: string,
  confirmations: {
    accuracyReviewed: boolean;
    noPHI: boolean;
    policyReferencesCorrect: boolean;
  }
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId,
    actorType: "user",
    action: "exported",
    description: `Document exported as ${format.toUpperCase()}`,
    outputHash,
    workflowVersion,
    metadata: {
      format,
      confirmations,
    },
  });
}

/**
 * Log a cancellation event
 */
export async function logCancelled(
  workflowRunId: string,
  actorId: string,
  workflowVersion: number,
  reason?: string
): Promise<AuditEventRecord> {
  return logAuditEvent({
    workflowRunId,
    actorId,
    actorType: "user",
    action: "cancelled",
    description: reason ? `Workflow cancelled: ${reason}` : "Workflow cancelled",
    workflowVersion,
    metadata: {
      reason,
    },
  });
}

// ============================================================================
// AUDIT TRAIL RETRIEVAL
// ============================================================================

/**
 * Get all audit events for a workflow run
 */
export async function getAuditTrail(
  workflowRunId: string
): Promise<AuditEventRecord[]> {
  await connectDB();
  const events = await AuditEvent.find({ workflowRunId }).sort({ timestamp: -1 });

  return events.map((e) => {
    const obj = e.toJSON() as Record<string, unknown>;
    return {
      id: obj.id as string,
      workflowRunId: String(obj.workflowRunId),
      actorId: obj.actorId as string,
      actorType: obj.actorType as "user" | "system",
      action: obj.action as AuditAction,
      description: (obj.description as string) ?? undefined,
      inputHash: (obj.inputHash as string) ?? undefined,
      outputHash: (obj.outputHash as string) ?? undefined,
      metadata: obj.metadata as Record<string, unknown> | undefined,
      rationale: (obj.rationale as string) ?? undefined,
      workflowVersion: obj.workflowVersion as number,
      timestamp: obj.timestamp as Date,
    };
  });
}

/**
 * Get audit events by action type
 */
export async function getAuditEventsByAction(
  workflowRunId: string,
  action: AuditAction
): Promise<AuditEventRecord[]> {
  const events = await getAuditTrail(workflowRunId);
  return events.filter((e) => e.action === action);
}

/**
 * Verify audit trail integrity
 * Checks that all hashes are consistent and events are in order
 */
export async function verifyAuditTrailIntegrity(
  workflowRunId: string
): Promise<{
  valid: boolean;
  errors: string[];
}> {
  const events = await getAuditTrail(workflowRunId);
  const errors: string[] = [];

  // Check for required events
  const hasCreated = events.some((e) => e.action === "created");
  if (!hasCreated) {
    errors.push("Missing workflow creation event");
  }

  // Check timestamps are in order
  for (let i = 1; i < events.length; i++) {
    const prev = events[i - 1];
    const curr = events[i];
    // Events are ordered desc, so prev should be >= curr
    if (prev.timestamp < curr.timestamp) {
      errors.push(
        `Timestamp ordering error: event ${prev.id} has earlier timestamp than ${curr.id}`
      );
    }
  }

  // Check for duplicate event IDs
  const ids = events.map((e) => e.id);
  const uniqueIds = new Set(ids);
  if (ids.length !== uniqueIds.size) {
    errors.push("Duplicate event IDs detected");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// AUDIT EXPORT
// ============================================================================

/**
 * Export audit trail as a human-readable report
 */
export function formatAuditTrailReport(events: AuditEventRecord[]): string {
  const lines: string[] = [
    "# Workflow Audit Trail",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Total Events: ${events.length}`,
    "",
    "---",
    "",
  ];

  // Sort events chronologically for the report
  const sortedEvents = [...events].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
  );

  for (const event of sortedEvents) {
    lines.push(`## ${formatTimestamp(event.timestamp)} - ${formatAction(event.action)}`);
    lines.push("");
    lines.push(`- **Actor:** ${event.actorId} (${event.actorType})`);
    if (event.description) {
      lines.push(`- **Description:** ${event.description}`);
    }
    if (event.inputHash) {
      lines.push(`- **Input Hash:** ${event.inputHash.slice(0, 16)}...`);
    }
    if (event.outputHash) {
      lines.push(`- **Output Hash:** ${event.outputHash.slice(0, 16)}...`);
    }
    if (event.rationale) {
      lines.push(`- **Rationale:** ${event.rationale}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Export audit trail as JSON
 */
export function exportAuditTrailAsJson(events: AuditEventRecord[]): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      totalEvents: events.length,
      events: events.map((e) => ({
        ...e,
        timestamp: e.timestamp.toISOString(),
      })),
    },
    null,
    2
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatAction(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    created: "Workflow Created",
    updated: "Inputs Updated",
    guardrail_triggered: "Guardrail Triggered",
    guardrail_overridden: "Guardrail Overridden",
    generated: "Artifact Generated",
    reviewed: "Artifact Reviewed",
    approved: "Artifact Approved",
    exported: "Document Exported",
    cancelled: "Workflow Cancelled",
  };
  return labels[action] || action;
}
