import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { TrackedDocument } from "@ascenta/db/workflow-schema";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await connectDB();

    // Fetch the employee record
    const employeeDoc = await Employee.findById(id);
    if (!employeeDoc) {
      return NextResponse.json(
        { error: "Employee not found" },
        { status: 404 }
      );
    }

    const employee = employeeDoc.toJSON() as Record<string, unknown>;

    // Extract notes from embedded array, sorted by occurredAt desc
    const notes = ((employee.notes as Record<string, unknown>[]) ?? [])
      .sort((a, b) => {
        const aDate = a.occurredAt ? new Date(a.occurredAt as string).getTime() : 0;
        const bDate = b.occurredAt ? new Date(b.occurredAt as string).getTime() : 0;
        return bDate - aDate;
      });

    // Fetch tracked documents ordered by createdAt desc
    const documentDocs = await TrackedDocument.find({ employeeId: id })
      .sort({ createdAt: -1 })
      .lean();

    const documents = documentDocs.map((d) => ({
      ...d,
      id: String(d._id),
    }));

    return NextResponse.json({ employee, notes, documents });
  } catch (error) {
    console.error("Failed to fetch employee detail:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
