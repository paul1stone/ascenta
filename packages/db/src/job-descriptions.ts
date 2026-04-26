import mongoose, { Types } from "mongoose";
import { JobDescription, type JobDescription_Type } from "./job-description-schema";
import { Employee } from "./employee-schema";
import type {
  Level,
  EmploymentType,
  JdStatus,
} from "./job-description-constants";

export interface ListFilters {
  q?: string;
  department?: string;
  level?: Level;
  employmentType?: EmploymentType;
  status?: JdStatus | "all";
  limit?: number;
  offset?: number;
}

export interface ListedJobDescription {
  id: string;
  title: string;
  department: string;
  level: Level;
  employmentType: EmploymentType;
  roleSummary: string;
  coreResponsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  competencies: string[];
  status: JdStatus;
  createdAt: Date;
  updatedAt: Date;
  assignedCount: number;
}

export async function listJobDescriptions(
  filters: ListFilters,
): Promise<{ items: ListedJobDescription[]; total: number }> {
  const limit = Math.min(Math.max(filters.limit ?? 50, 1), 200);
  const offset = Math.max(filters.offset ?? 0, 0);

  const match: Record<string, unknown> = {};
  if (filters.status && filters.status !== "all") {
    match.status = filters.status;
  } else if (!filters.status) {
    match.status = "published";
  }
  if (filters.department) match.department = filters.department;
  if (filters.level) match.level = filters.level;
  if (filters.employmentType) match.employmentType = filters.employmentType;
  if (filters.q && filters.q.trim()) {
    const re = new RegExp(escapeRegex(filters.q.trim()), "i");
    match.$or = [{ title: re }, { roleSummary: re }];
  }

  const [items, total] = await Promise.all([
    JobDescription.aggregate([
      { $match: match },
      { $sort: { updatedAt: -1 } },
      { $skip: offset },
      { $limit: limit },
      {
        $lookup: {
          from: "employees",
          let: { jdId: "$_id" },
          pipeline: [
            { $match: { $expr: { $eq: ["$jobDescriptionId", "$$jdId"] } } },
            { $count: "n" },
          ],
          as: "_assigned",
        },
      },
      {
        $addFields: {
          id: { $toString: "$_id" },
          assignedCount: {
            $ifNull: [{ $arrayElemAt: ["$_assigned.n", 0] }, 0],
          },
        },
      },
      { $project: { _id: 0, __v: 0, _assigned: 0 } },
    ]),
    JobDescription.countDocuments(match),
  ]);

  return { items: items as ListedJobDescription[], total };
}

export async function getJobDescriptionById(
  id: string,
): Promise<JobDescription_Type | null> {
  if (!mongoose.isValidObjectId(id)) return null;
  const doc = await JobDescription.findById(id).lean();
  if (!doc) return null;
  const { _id, __v: _v, ...rest } = doc as Record<string, unknown> & {
    _id: unknown;
    __v?: unknown;
  };
  return { ...rest, id: String(_id) } as JobDescription_Type;
}

export async function listAssignedEmployees(jobDescriptionId: string) {
  if (!mongoose.isValidObjectId(jobDescriptionId)) return [];
  return Employee.find({
    jobDescriptionId: new Types.ObjectId(jobDescriptionId),
  })
    .sort({ lastName: 1, firstName: 1 })
    .lean();
}

export async function countAssignedEmployees(
  jobDescriptionIds: string[],
): Promise<Record<string, number>> {
  const valid = jobDescriptionIds
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new Types.ObjectId(id));
  if (!valid.length) return {};
  const rows = await Employee.aggregate([
    { $match: { jobDescriptionId: { $in: valid } } },
    { $group: { _id: "$jobDescriptionId", n: { $sum: 1 } } },
  ]);
  const result: Record<string, number> = {};
  for (const id of jobDescriptionIds) result[id] = 0;
  for (const row of rows) result[String(row._id)] = row.n;
  return result;
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
