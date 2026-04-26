import mongoose from "mongoose";
import { FocusLayer } from "./focus-layer-schema";

type ResponseFields = Partial<{
  uniqueContribution: string;
  highImpactArea: string;
  signatureResponsibility: string;
  workingStyle: string;
}>;

export async function getFocusLayerByEmployee(employeeId: string) {
  if (!mongoose.isValidObjectId(employeeId)) return null;
  return FocusLayer.findOne({ employeeId }).lean();
}

export async function upsertFocusLayerDraft(
  employeeId: string,
  jobDescriptionId: string | null,
  responses: ResponseFields
) {
  if (!mongoose.isValidObjectId(employeeId)) {
    throw new Error("Invalid employeeId");
  }

  const existing = await FocusLayer.findOne({ employeeId });
  const wasConfirmed = existing?.status === "confirmed";

  const update: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(responses)) {
    if (typeof v === "string") update[`responses.${k}`] = v;
  }
  if (jobDescriptionId !== undefined) {
    update.jobDescriptionId = jobDescriptionId;
  }
  if (wasConfirmed) {
    update.status = "submitted";
    update["managerConfirmed.at"] = null;
    update["managerConfirmed.byUserId"] = null;
    update["managerConfirmed.comment"] = null;
    update["employeeSubmitted.at"] = new Date();
  } else if (!existing) {
    update.status = "draft";
  }

  return FocusLayer.findOneAndUpdate(
    { employeeId },
    { $set: update, $setOnInsert: { employeeId } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function submitFocusLayer(employeeId: string) {
  const fl = await FocusLayer.findOne({ employeeId });
  if (!fl) throw new Error("Focus Layer not found");
  const r = fl.responses ?? {};
  const fields = [
    "uniqueContribution",
    "highImpactArea",
    "signatureResponsibility",
    "workingStyle",
  ] as const;
  for (const f of fields) {
    const v = r[f];
    if (!v || typeof v !== "string" || v.trim().length < 20) {
      throw new Error(`Field ${f} requires at least 20 characters before submitting`);
    }
  }
  fl.status = "submitted";
  fl.employeeSubmitted = { at: new Date() };
  fl.managerConfirmed = { at: null, byUserId: null, comment: null };
  await fl.save();
  return fl.toJSON();
}

export async function confirmFocusLayer(
  employeeId: string,
  byUserId: string,
  comment: string | null
) {
  const fl = await FocusLayer.findOne({ employeeId });
  if (!fl) throw new Error("Focus Layer not found");
  if (fl.status !== "submitted") {
    throw new Error(`Cannot confirm Focus Layer in status ${fl.status}`);
  }
  fl.status = "confirmed";
  fl.managerConfirmed = {
    at: new Date(),
    byUserId,
    comment: comment ?? null,
  };
  await fl.save();
  return fl.toJSON();
}

export async function listSubmittedAwaitingConfirmation(managerEmployeeIds: string[]) {
  return FocusLayer.find({
    employeeId: { $in: managerEmployeeIds },
    status: "submitted",
  }).lean();
}
