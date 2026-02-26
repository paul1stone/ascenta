/**
 * Tracked documents - progress pipeline (Kanban) — Mongoose
 */

import { TrackedDocument, WorkflowOutput } from "./workflow-schema";
import { getEmployeeByEmployeeId, addEmployeeNote } from "./employees";
import type { TrackedDocumentStage } from "./workflow-schema";

export type { TrackedDocumentStage };

export type TrackedDocumentWithRun = Awaited<ReturnType<typeof listTrackedDocuments>>[number];

/** Safely parse completedActions field into a typed record */
function parseCompletedActions(value: unknown): Record<string, boolean> {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, boolean>;
  }
  return {};
}

function toPlain(doc: InstanceType<typeof TrackedDocument>) {
  const obj = doc.toJSON() as Record<string, unknown>;
  return {
    id: obj.id as string,
    workflowRunId: String(obj.workflowRunId),
    workflowOutputId: obj.workflowOutputId ? String(obj.workflowOutputId) : null,
    title: obj.title as string,
    documentType: (obj.documentType as string) ?? "corrective_action",
    employeeName: (obj.employeeName as string) ?? null,
    employeeId: obj.employeeId ? String(obj.employeeId) : null,
    stage: obj.stage as string,
    completedActions: obj.completedActions,
    employeeEmail: (obj.employeeEmail as string) ?? null,
    sentAt: (obj.sentAt as Date) ?? null,
    acknowledgedAt: (obj.acknowledgedAt as Date) ?? null,
    ackToken: (obj.ackToken as string) ?? null,
    reminderSentAt: (obj.reminderSentAt as Date) ?? null,
    reminderCount: (obj.reminderCount as number) ?? 0,
    createdAt: obj.createdAt as Date,
    updatedAt: obj.updatedAt as Date,
  };
}

export async function createTrackedDocument(
  data: {
    workflowRunId: string;
    workflowOutputId?: string | null;
    title: string;
    documentType?: string;
    employeeName?: string | null;
    employeeId?: string | null;
    stage?: string;
    completedActions?: unknown;
    employeeEmail?: string | null;
  }
): Promise<{ id: string; workflowRunId: string; stage: string }> {
  const doc = await TrackedDocument.create({
    workflowRunId: data.workflowRunId,
    workflowOutputId: data.workflowOutputId ?? undefined,
    title: data.title,
    documentType: data.documentType ?? "corrective_action",
    employeeName: data.employeeName ?? undefined,
    employeeId: data.employeeId ?? undefined,
    stage: data.stage ?? "draft",
    completedActions: data.completedActions ?? {},
    employeeEmail: data.employeeEmail ?? undefined,
  });
  const obj = doc.toJSON() as Record<string, unknown>;
  return {
    id: obj.id as string,
    workflowRunId: String(obj.workflowRunId),
    stage: obj.stage as string,
  };
}

export async function getTrackedDocument(id: string) {
  const doc = await TrackedDocument.findById(id);
  return doc ? toPlain(doc) : null;
}

/** Get tracked document with rendered content from workflow output */
export async function getTrackedDocumentWithContent(id: string) {
  const doc = await TrackedDocument.findById(id);
  if (!doc) return null;

  let renderedContent: string | null = null;
  if (doc.workflowOutputId) {
    const out = await WorkflowOutput.findById(doc.workflowOutputId).select("renderedContent");
    renderedContent = (out as Record<string, unknown> | null)?.renderedContent as string ?? null;
  }
  if (!renderedContent && doc.workflowRunId) {
    const out = await WorkflowOutput.findOne({ workflowRunId: doc.workflowRunId })
      .sort({ version: -1 })
      .select("renderedContent");
    renderedContent = (out as Record<string, unknown> | null)?.renderedContent as string ?? null;
  }

  const plain = toPlain(doc);
  return {
    ...plain,
    renderedContent,
    completedActions: parseCompletedActions(plain.completedActions),
  };
}

export async function getTrackedDocumentByRunId(workflowRunId: string) {
  const doc = await TrackedDocument.findOne({ workflowRunId });
  return doc ? toPlain(doc) : null;
}

/** Create or update tracked document for a workflow run. Optionally links to employee and adds an employee note. */
export async function upsertTrackedDocumentForRun(params: {
  workflowRunId: string;
  title: string;
  employeeName?: string;
  employeeId?: string;
  documentType?: string;
}): Promise<{ id: string; stage: string }> {
  const outputId = await getLatestOutputIdForRun(params.workflowRunId);
  const existing = await getTrackedDocumentByRunId(params.workflowRunId);

  let employeeObjId: string | null = null;
  if (params.employeeId) {
    const emp = await getEmployeeByEmployeeId(params.employeeId);
    employeeObjId = emp?.id ?? null;
  }

  if (existing) {
    const updateFields: Record<string, unknown> = {
      title: params.title,
      employeeName: params.employeeName ?? existing.employeeName,
      workflowOutputId: outputId ?? existing.workflowOutputId,
    };
    if (employeeObjId) {
      updateFields.employeeId = employeeObjId;
    }

    const updated = await TrackedDocument.findByIdAndUpdate(
      existing.id,
      { $set: updateFields },
      { new: true }
    );
    if (!updated) throw new Error("Failed to update tracked document");
    const obj = updated.toJSON() as Record<string, unknown>;
    return { id: obj.id as string, stage: obj.stage as string };
  }

  // Create new tracked document
  const created = await createTrackedDocument({
    workflowRunId: params.workflowRunId,
    workflowOutputId: outputId,
    title: params.title,
    documentType: params.documentType ?? "corrective_action",
    employeeName: params.employeeName ?? null,
    employeeId: employeeObjId,
    stage: "on_us_to_send",
  });

  // Best-effort: add employee note
  if (employeeObjId && params.documentType === "corrective_action") {
    try {
      await addEmployeeNote(employeeObjId, {
        noteType: "written_warning",
        title: params.title,
        metadata: { trackedDocumentId: created.id },
      });
    } catch (err) {
      console.warn("Tracked document: could not add employee note", err);
    }
  }

  return { id: created.id, stage: created.stage };
}

export async function listTrackedDocuments(): Promise<
  { id: string; workflowRunId: string; title: string; documentType: string; employeeName: string | null; employeeId: string | null; stage: string; completedActions: Record<string, boolean>; createdAt: Date; updatedAt: Date }[]
> {
  const docs = await TrackedDocument.find().sort({ updatedAt: -1 });
  return docs.map((d: InstanceType<typeof TrackedDocument>) => {
    const plain = toPlain(d);
    return {
      id: plain.id,
      workflowRunId: plain.workflowRunId,
      title: plain.title,
      documentType: plain.documentType,
      employeeName: plain.employeeName,
      employeeId: plain.employeeId,
      stage: plain.stage,
      completedActions: parseCompletedActions(plain.completedActions),
      createdAt: plain.createdAt,
      updatedAt: plain.updatedAt,
    };
  });
}

export async function updateCompletedActions(
  id: string,
  completedActions: Record<string, boolean>
): Promise<{ id: string } | null> {
  const doc = await TrackedDocument.findByIdAndUpdate(
    id,
    { $set: { completedActions } },
    { new: true }
  );
  if (!doc) return null;
  return { id: (doc.toJSON() as Record<string, unknown>).id as string };
}

export async function updateTrackedDocumentStage(
  id: string,
  stage: TrackedDocumentStage
): Promise<{ id: string; stage: string } | null> {
  const doc = await TrackedDocument.findByIdAndUpdate(
    id,
    { $set: { stage } },
    { new: true }
  );
  if (!doc) return null;
  const obj = doc.toJSON() as Record<string, unknown>;
  return { id: obj.id as string, stage: obj.stage as string };
}

/** Get latest workflow output id for a run (for linking tracked doc to content) */
export async function getLatestOutputIdForRun(workflowRunId: string): Promise<string | null> {
  const out = await WorkflowOutput.findOne({ workflowRunId })
    .sort({ version: -1 })
    .select("_id");
  return out ? String(out._id) : null;
}
