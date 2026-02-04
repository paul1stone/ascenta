/**
 * Tracked documents - progress pipeline (Kanban)
 */

import { db } from "@/lib/db";
import { getEmployeeByEmployeeId, addEmployeeNote } from "@/lib/db/employees";
import { trackedDocuments, workflowOutputs } from "@/lib/db/workflow-schema";
import { eq, desc } from "drizzle-orm";
import type { NewTrackedDocument, TrackedDocumentStage } from "@/lib/db/workflow-schema";

export type { TrackedDocumentStage };

export type TrackedDocumentWithRun = Awaited<ReturnType<typeof listTrackedDocuments>>[number];

export async function createTrackedDocument(
  data: Omit<NewTrackedDocument, "id" | "createdAt" | "updatedAt">
): Promise<{ id: string; workflowRunId: string; stage: string }> {
  const [doc] = await db
    .insert(trackedDocuments)
    .values({
      ...data,
      updatedAt: new Date(),
    })
    .returning({ id: trackedDocuments.id, workflowRunId: trackedDocuments.workflowRunId, stage: trackedDocuments.stage });
  if (!doc) throw new Error("Failed to create tracked document");
  return doc;
}

export async function getTrackedDocument(id: string) {
  const [doc] = await db.select().from(trackedDocuments).where(eq(trackedDocuments.id, id)).limit(1);
  return doc ?? null;
}

/** Get tracked document with rendered content from workflow output */
export async function getTrackedDocumentWithContent(id: string) {
  const [doc] = await db.select().from(trackedDocuments).where(eq(trackedDocuments.id, id)).limit(1);
  if (!doc) return null;
  let renderedContent: string | null = null;
  if (doc.workflowOutputId) {
    const [out] = await db
      .select({ renderedContent: workflowOutputs.renderedContent })
      .from(workflowOutputs)
      .where(eq(workflowOutputs.id, doc.workflowOutputId))
      .limit(1);
    renderedContent = out?.renderedContent ?? null;
  }
  if (!renderedContent && doc.workflowRunId) {
    const [out] = await db
      .select({ renderedContent: workflowOutputs.renderedContent })
      .from(workflowOutputs)
      .where(eq(workflowOutputs.workflowRunId, doc.workflowRunId))
      .orderBy(desc(workflowOutputs.version))
      .limit(1);
    renderedContent = out?.renderedContent ?? null;
  }
  return {
    ...doc,
    renderedContent,
    completedActions: (doc.completedActions as Record<string, boolean>) ?? {},
  };
}

export async function getTrackedDocumentByRunId(workflowRunId: string) {
  const [doc] = await db
    .select()
    .from(trackedDocuments)
    .where(eq(trackedDocuments.workflowRunId, workflowRunId))
    .limit(1);
  return doc ?? null;
}

/** Create or update tracked document for a workflow run (e.g. after generating in chat). Optionally links to employee and adds an employee note. */
export async function upsertTrackedDocumentForRun(params: {
  workflowRunId: string;
  title: string;
  employeeName?: string;
  /** Text employee ID (e.g. EMP1001) from run inputs – used to link doc to employee and add employee note */
  employeeId?: string;
  documentType?: string;
}): Promise<{ id: string; stage: string }> {
  const outputId = await getLatestOutputIdForRun(params.workflowRunId);
  const existing = await getTrackedDocumentByRunId(params.workflowRunId);

  let employeeUuid: string | null = null;
  if (params.employeeId) {
    const emp = await getEmployeeByEmployeeId(params.employeeId);
    employeeUuid = emp?.id ?? null;
  }

  if (existing) {
    const [updated] = await db
      .update(trackedDocuments)
      .set({
        title: params.title,
        employeeName: params.employeeName ?? existing.employeeName,
        workflowOutputId: outputId ?? existing.workflowOutputId,
        updatedAt: new Date(),
      })
      .where(eq(trackedDocuments.id, existing.id))
      .returning({ id: trackedDocuments.id, stage: trackedDocuments.stage });
    if (!updated) throw new Error("Failed to update tracked document");
    if (employeeUuid) {
      try {
        await db
          .update(trackedDocuments)
          .set({ employeeId: employeeUuid, updatedAt: new Date() })
          .where(eq(trackedDocuments.id, existing.id));
      } catch (err) {
        console.warn("Tracked document: could not set employeeId", err);
      }
    }
    return updated;
  }

  // Create document without employeeId first so generation succeeds even if migration not applied
  const created = await createTrackedDocument({
    workflowRunId: params.workflowRunId,
    workflowOutputId: outputId,
    title: params.title,
    documentType: params.documentType ?? "corrective_action",
    employeeName: params.employeeName ?? null,
    stage: "on_us_to_send",
  });

  // Best-effort: link to employee and add note (skip if column missing or note fails)
  if (employeeUuid && params.documentType === "corrective_action") {
    try {
      await db
        .update(trackedDocuments)
        .set({ employeeId: employeeUuid, updatedAt: new Date() })
        .where(eq(trackedDocuments.id, created.id));
      await addEmployeeNote(employeeUuid, {
        noteType: "written_warning",
        title: params.title,
        metadata: { trackedDocumentId: created.id },
      });
    } catch (err) {
      console.warn("Tracked document: could not link employee or add note", err);
    }
  }

  return { id: created.id, stage: created.stage };
}

export async function listTrackedDocuments(): Promise<
  { id: string; workflowRunId: string; title: string; documentType: string; employeeName: string | null; employeeId: string | null; stage: string; completedActions: Record<string, boolean>; createdAt: Date; updatedAt: Date }[]
> {
  const docs = await db
    .select({
      id: trackedDocuments.id,
      workflowRunId: trackedDocuments.workflowRunId,
      title: trackedDocuments.title,
      documentType: trackedDocuments.documentType,
      employeeName: trackedDocuments.employeeName,
      employeeId: trackedDocuments.employeeId,
      stage: trackedDocuments.stage,
      completedActions: trackedDocuments.completedActions,
      createdAt: trackedDocuments.createdAt,
      updatedAt: trackedDocuments.updatedAt,
    })
    .from(trackedDocuments)
    .orderBy(desc(trackedDocuments.updatedAt));
  return docs.map((d) => ({
    ...d,
    completedActions: (d.completedActions as Record<string, boolean>) ?? {},
  }));
}

export async function updateCompletedActions(
  id: string,
  completedActions: Record<string, boolean>
): Promise<{ id: string } | null> {
  const [updated] = await db
    .update(trackedDocuments)
    .set({ completedActions, updatedAt: new Date() })
    .where(eq(trackedDocuments.id, id))
    .returning({ id: trackedDocuments.id });
  return updated ?? null;
}

export async function updateTrackedDocumentStage(
  id: string,
  stage: TrackedDocumentStage
): Promise<{ id: string; stage: string } | null> {
  const [updated] = await db
    .update(trackedDocuments)
    .set({ stage, updatedAt: new Date() })
    .where(eq(trackedDocuments.id, id))
    .returning({ id: trackedDocuments.id, stage: trackedDocuments.stage });
  return updated ?? null;
}

/** Get latest workflow output id for a run (for linking tracked doc to content) */
export async function getLatestOutputIdForRun(workflowRunId: string): Promise<string | null> {
  const [out] = await db
    .select({ id: workflowOutputs.id })
    .from(workflowOutputs)
    .where(eq(workflowOutputs.workflowRunId, workflowRunId))
    .orderBy(desc(workflowOutputs.version))
    .limit(1);
  return out?.id ?? null;
}
