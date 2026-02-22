import { db } from "@ascenta/db";
import { employees, employeeNotes } from "@ascenta/db/employee-schema";
import { trackedDocuments } from "@ascenta/db/workflow-schema";
import { eq, desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch the employee record
    const [employee] = await db
      .select()
      .from(employees)
      .where(eq(employees.id, id))
      .limit(1);

    if (!employee) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    // Fetch notes ordered by occurredAt desc
    const notes = await db
      .select()
      .from(employeeNotes)
      .where(eq(employeeNotes.employeeId, id))
      .orderBy(desc(employeeNotes.occurredAt));

    // Fetch tracked documents ordered by createdAt desc
    const documents = await db
      .select()
      .from(trackedDocuments)
      .where(eq(trackedDocuments.employeeId, id))
      .orderBy(desc(trackedDocuments.createdAt));

    return NextResponse.json({ employee, notes, documents });
  } catch (error) {
    console.error("Failed to fetch employee detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
