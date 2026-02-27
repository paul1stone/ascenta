import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { Employee } from "@ascenta/db/employee-schema";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { employee, type, content, context, relatedGoal, relatedCheckIn, visibility, author } =
      body as {
        employee?: string;
        type?: string;
        content?: string;
        context?: string;
        relatedGoal?: string;
        relatedCheckIn?: string;
        visibility?: string;
        author?: string;
      };

    // Validate required fields
    if (!employee || !type || !content) {
      return NextResponse.json(
        { error: "Missing required fields: employee, type, content" },
        { status: 400 }
      );
    }

    // For MVP, use first active employee as author when not provided
    let authorId = author;
    if (!authorId) {
      const firstEmployee = await Employee.findOne({ status: "active" })
        .sort({ createdAt: 1 })
        .select("_id");
      if (!firstEmployee) {
        return NextResponse.json(
          { error: "No active employee found to use as author" },
          { status: 400 }
        );
      }
      authorId = firstEmployee._id.toString();
    }

    const note = await PerformanceNote.create({
      employee,
      author: authorId,
      type,
      content,
      context: context ?? null,
      relatedGoal: relatedGoal ?? null,
      relatedCheckIn: relatedCheckIn ?? null,
      visibility: visibility ?? "manager_only",
    });

    return NextResponse.json(note.toJSON(), { status: 201 });
  } catch (error) {
    console.error("Create performance note error:", error);
    return NextResponse.json(
      { error: "Failed to create performance note" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const employee = searchParams.get("employee");
    const type = searchParams.get("type");
    const author = searchParams.get("author");

    const filter: Record<string, string> = {};
    if (employee) filter.employee = employee;
    if (type) filter.type = type;
    if (author) filter.author = author;

    const notes = await PerformanceNote.find(filter)
      .populate("employee", "firstName lastName email")
      .populate("author", "firstName lastName")
      .populate("relatedGoal", "statement")
      .sort({ createdAt: -1 });

    return NextResponse.json(
      notes.map((n: InstanceType<typeof PerformanceNote>) => n.toJSON())
    );
  } catch (error) {
    console.error("List performance notes error:", error);
    return NextResponse.json(
      { error: "Failed to list performance notes" },
      { status: 500 }
    );
  }
}
