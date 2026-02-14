/**
 * Employee data access layer
 */

import { db } from "@/lib/db";
import { employees, employeeNotes } from "@/lib/db/employee-schema";
import { eq, ilike, or, and, desc } from "drizzle-orm";

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

/**
 * Search employees by name (partial match)
 * Handles full names like "Brandon White" by matching firstName + lastName
 */
export async function searchEmployees(query: string): Promise<EmployeeWithNotes[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const term = `%${trimmed}%`;
  const words = trimmed.split(/\s+/).filter(Boolean);

  // Build conditions: single word OR "First Last" (firstName AND lastName)
  const conditions = [
    ilike(employees.firstName, term),
    ilike(employees.lastName, term),
    ilike(employees.email, term),
    ilike(employees.employeeId, term),
  ];

  // For "First Last", match firstName AND lastName (e.g. "Brandon White")
  if (words.length >= 2) {
    const firstWord = `%${words[0]}%`;
    const lastWord = `%${words[words.length - 1]}%`;
    const combined = and(
      ilike(employees.firstName, firstWord),
      ilike(employees.lastName, lastWord)
    );
    if (combined) {
      conditions.push(combined);
    }
  }

  const results = await db
    .select()
    .from(employees)
    .where(or(...conditions))
    .limit(10);

  const withNotes: EmployeeWithNotes[] = [];
  for (const emp of results) {
    const notes = await db
      .select({
        id: employeeNotes.id,
        noteType: employeeNotes.noteType,
        title: employeeNotes.title,
        content: employeeNotes.content,
        severity: employeeNotes.severity,
        occurredAt: employeeNotes.occurredAt,
      })
      .from(employeeNotes)
      .where(eq(employeeNotes.employeeId, emp.id))
      .orderBy(desc(employeeNotes.occurredAt));

    withNotes.push({
      id: emp.id,
      employeeId: emp.employeeId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      fullName: `${emp.firstName} ${emp.lastName}`,
      email: emp.email,
      department: emp.department,
      jobTitle: emp.jobTitle,
      managerName: emp.managerName,
      hireDate: emp.hireDate,
      notes: notes.map((n) => ({
        id: n.id,
        noteType: n.noteType,
        title: n.title,
        content: n.content,
        severity: n.severity,
        occurredAt: n.occurredAt,
      })),
    });
  }
  return withNotes;
}

/**
 * Get employee by text employee ID (e.g. EMP1001)
 */
export async function getEmployeeByEmployeeId(
  employeeIdText: string
): Promise<EmployeeWithNotes | null> {
  const [emp] = await db
    .select()
    .from(employees)
    .where(eq(employees.employeeId, employeeIdText.trim()))
    .limit(1);
  if (!emp) return null;
  const notes = await db
    .select({
      id: employeeNotes.id,
      noteType: employeeNotes.noteType,
      title: employeeNotes.title,
      content: employeeNotes.content,
      severity: employeeNotes.severity,
      occurredAt: employeeNotes.occurredAt,
    })
    .from(employeeNotes)
    .where(eq(employeeNotes.employeeId, emp.id))
    .orderBy(desc(employeeNotes.occurredAt));
  return {
    id: emp.id,
    employeeId: emp.employeeId,
    firstName: emp.firstName,
    lastName: emp.lastName,
    fullName: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    department: emp.department,
    jobTitle: emp.jobTitle,
    managerName: emp.managerName,
    hireDate: emp.hireDate,
    notes: notes.map((n) => ({
      id: n.id,
      noteType: n.noteType,
      title: n.title,
      content: n.content,
      severity: n.severity,
      occurredAt: n.occurredAt,
    })),
  };
}

/**
 * Get employee by ID (uuid)
 */
export async function getEmployeeById(id: string): Promise<EmployeeWithNotes | null> {
  const [emp] = await db.select().from(employees).where(eq(employees.id, id)).limit(1);
  if (!emp) return null;

  const notes = await db
    .select({
      id: employeeNotes.id,
      noteType: employeeNotes.noteType,
      title: employeeNotes.title,
      content: employeeNotes.content,
      severity: employeeNotes.severity,
      occurredAt: employeeNotes.occurredAt,
    })
    .from(employeeNotes)
    .where(eq(employeeNotes.employeeId, emp.id))
    .orderBy(desc(employeeNotes.occurredAt));

  return {
    id: emp.id,
    employeeId: emp.employeeId,
    firstName: emp.firstName,
    lastName: emp.lastName,
    fullName: `${emp.firstName} ${emp.lastName}`,
    email: emp.email,
    department: emp.department,
    jobTitle: emp.jobTitle,
    managerName: emp.managerName,
    hireDate: emp.hireDate,
    notes: notes.map((n) => ({
      id: n.id,
      noteType: n.noteType,
      title: n.title,
      content: n.content,
      severity: n.severity,
      occurredAt: n.occurredAt,
    })),
  };
}

/**
 * Add a note to an employee's file (e.g. written_warning when a corrective action is created)
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
  const [note] = await db
    .insert(employeeNotes)
    .values({
      employeeId,
      noteType: data.noteType,
      title: data.title,
      content: data.content ?? null,
      severity: data.severity ?? null,
      occurredAt: data.occurredAt ?? new Date(),
      metadata: data.metadata ?? null,
    })
    .returning({ id: employeeNotes.id });
  if (!note) throw new Error("Failed to add employee note");
  return note;
}
