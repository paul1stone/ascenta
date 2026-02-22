import { NextResponse } from "next/server";
import { db } from "@ascenta/db";
import { employees } from "@ascenta/db/employee-schema";
import { eq, sql, count, ilike, or, and } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const offset = (page - 1) * limit;

    // Build filter conditions
    const conditions = [];

    if (search) {
      const pattern = `%${search}%`;
      conditions.push(
        or(
          ilike(employees.firstName, pattern),
          ilike(employees.lastName, pattern),
          ilike(employees.email, pattern),
          ilike(employees.employeeId, pattern)
        )!
      );
    }

    if (department) {
      conditions.push(eq(employees.department, department));
    }

    if (status) {
      conditions.push(eq(employees.status, status));
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    // Note count subquery
    const notesCountSq = sql<number>`(
      SELECT count(*)::int
      FROM employee_notes
      WHERE employee_notes.employee_id = ${employees.id}
    )`.as("notes_count");

    // Active document count subquery
    const documentsCountSq = sql<number>`(
      SELECT count(*)::int
      FROM tracked_documents
      WHERE tracked_documents.employee_id = ${employees.id}
    )`.as("documents_count");

    // Main query with subquery counts
    const employeeRows = await db
      .select({
        id: employees.id,
        employeeId: employees.employeeId,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        department: employees.department,
        jobTitle: employees.jobTitle,
        managerName: employees.managerName,
        hireDate: employees.hireDate,
        status: employees.status,
        createdAt: employees.createdAt,
        updatedAt: employees.updatedAt,
        notesCount: notesCountSq,
        documentsCount: documentsCountSq,
      })
      .from(employees)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(employees.lastName, employees.firstName);

    // Total count for pagination
    const [totalResult] = await db
      .select({ count: count() })
      .from(employees)
      .where(whereClause);

    return NextResponse.json({
      employees: employeeRows,
      total: totalResult.count,
      page,
      limit,
    });
  } catch (error) {
    console.error("Dashboard employees error:", error);
    return NextResponse.json(
      { error: "Failed to fetch employees" },
      { status: 500 }
    );
  }
}
