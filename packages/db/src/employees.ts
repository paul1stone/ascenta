/**
 * Employee data access layer (Mongoose)
 */

import { Employee } from "./employee-schema";

type GetToKnow = {
  personalBio?: string;
  hobbies?: string;
  funFacts?: string[];
  askMeAbout?: string;
  hometown?: string;
  currentlyConsuming?: string;
  employeeChoice?: { label?: string; value?: string };
};

const COMPLETION_KEYS = [
  "personalBio",
  "hobbies",
  "funFacts",
  "askMeAbout",
  "hometown",
  "currentlyConsuming",
  "employeeChoice",
] as const;
type CompletionKey = (typeof COMPLETION_KEYS)[number];

function isComplete(key: CompletionKey, gtk: GetToKnow): boolean {
  if (key === "funFacts") {
    return (
      Array.isArray(gtk.funFacts) &&
      gtk.funFacts.some((s) => typeof s === "string" && s.trim().length > 0)
    );
  }
  if (key === "employeeChoice") {
    return !!(
      gtk.employeeChoice?.label?.trim() && gtk.employeeChoice?.value?.trim()
    );
  }
  const v = gtk[key];
  return typeof v === "string" && v.trim().length > 0;
}

export function computeProfileCompletion(profile: { getToKnow?: GetToKnow }): {
  complete: number;
  total: number;
  percent: number;
  missingKeys: CompletionKey[];
} {
  const gtk = profile.getToKnow ?? {};
  const missing: CompletionKey[] = [];
  let complete = 0;
  for (const k of COMPLETION_KEYS) {
    if (isComplete(k, gtk)) complete++;
    else missing.push(k);
  }
  const total = COMPLETION_KEYS.length;
  return {
    complete,
    total,
    percent: Math.round((complete / total) * 100),
    missingKeys: missing,
  };
}

export interface EmployeeWithNotes {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  department: string;
  jobTitle: string;
  managerName: string;
  hireDate: Date;
  notes: {
    id: string;
    noteType: string;
    title: string;
    content: string | null;
    severity: string | null;
    occurredAt: Date;
  }[];
}

function toEmployeeWithNotes(doc: InstanceType<typeof Employee>): EmployeeWithNotes {
  const obj = doc.toJSON() as Record<string, unknown>;
  const rawNotes = (obj.notes ?? []) as Record<string, unknown>[];
  const notes = rawNotes
    .sort((a, b) => new Date(b.occurredAt as string).getTime() - new Date(a.occurredAt as string).getTime())
    .map((n) => ({
      id: (n.id as string) ?? String(n._id),
      noteType: n.noteType as string,
      title: n.title as string,
      content: (n.content as string | null) ?? null,
      severity: (n.severity as string | null) ?? null,
      occurredAt: n.occurredAt as Date,
    }));

  return {
    id: obj.id as string,
    employeeId: obj.employeeId as string,
    firstName: obj.firstName as string,
    lastName: obj.lastName as string,
    fullName: `${obj.firstName} ${obj.lastName}`,
    email: obj.email as string,
    department: obj.department as string,
    jobTitle: obj.jobTitle as string,
    managerName: obj.managerName as string,
    hireDate: obj.hireDate as Date,
    notes,
  };
}

/**
 * Search employees by name (partial match)
 * Handles full names like "Brandon White" by matching firstName + lastName
 */
export async function searchEmployees(query: string): Promise<EmployeeWithNotes[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const escapedTerm = trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const words = trimmed.split(/\s+/).filter(Boolean);

  const conditions: Record<string, unknown>[] = [
    { firstName: { $regex: escapedTerm, $options: "i" } },
    { lastName: { $regex: escapedTerm, $options: "i" } },
    { email: { $regex: escapedTerm, $options: "i" } },
    { employeeId: { $regex: escapedTerm, $options: "i" } },
  ];

  if (words.length >= 2) {
    const firstWord = words[0].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const lastWord = words[words.length - 1].replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    conditions.push({
      $and: [
        { firstName: { $regex: firstWord, $options: "i" } },
        { lastName: { $regex: lastWord, $options: "i" } },
      ],
    });
  }

  const docs = await Employee.find({ $or: conditions }).limit(10);
  return docs.map(toEmployeeWithNotes);
}

/**
 * Get employee by text employee ID (e.g. EMP1001)
 */
export async function getEmployeeByEmployeeId(
  employeeIdText: string
): Promise<EmployeeWithNotes | null> {
  const doc = await Employee.findOne({ employeeId: employeeIdText.trim() });
  return doc ? toEmployeeWithNotes(doc) : null;
}

/**
 * Get employee by ID (ObjectId string)
 */
export async function getEmployeeById(id: string): Promise<EmployeeWithNotes | null> {
  const doc = await Employee.findById(id);
  return doc ? toEmployeeWithNotes(doc) : null;
}

/**
 * Add a note to an employee's file (push to embedded array)
 */
export async function addEmployeeNote(
  employeeId: string,
  data: {
    noteType: string;
    title: string;
    content?: string | null;
    severity?: string | null;
    occurredAt?: Date;
    metadata?: Record<string, unknown> | null;
  }
): Promise<{ id: string }> {
  const doc = await Employee.findByIdAndUpdate(
    employeeId,
    {
      $push: {
        notes: {
          noteType: data.noteType,
          title: data.title,
          content: data.content ?? undefined,
          severity: data.severity ?? undefined,
          occurredAt: data.occurredAt ?? new Date(),
          metadata: data.metadata ?? undefined,
          createdAt: new Date(),
        },
      },
    },
    { new: true }
  );
  if (!doc) throw new Error("Failed to add employee note — employee not found");
  const notes = (doc as Record<string, unknown>).notes as Record<string, unknown>[];
  const lastNote = notes[notes.length - 1];
  return { id: String((lastNote as Record<string, unknown>)._id ?? (lastNote as Record<string, unknown>).id) };
}

// Org chart tree builder + neighborhood trimmer live in ./org-tree so
// they can be imported from client components without dragging in the
// Mongoose Employee schema. Re-export for back-compat with existing
// server-side callers.
export {
  buildOrgTree,
  buildOrgNeighborhood,
  type OrgNode,
  type UnfilledRoleCluster,
  type OrgTreeResponse,
} from "./org-tree";
