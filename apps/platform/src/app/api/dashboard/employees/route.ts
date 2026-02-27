import { NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { Employee } from "@ascenta/db/employee-schema";
import { TrackedDocument } from "@ascenta/db/workflow-schema";
import type { PipelineStage } from "mongoose";

export async function GET(request: Request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      100,
      Math.max(1, parseInt(searchParams.get("limit") || "20", 10))
    );
    const skip = (page - 1) * limit;

    // Build match conditions
    const match: Record<string, unknown> = {};

    if (search) {
      const regex = { $regex: search, $options: "i" };
      match.$or = [
        { firstName: regex },
        { lastName: regex },
        { email: regex },
        { employeeId: regex },
      ];
    }

    if (department) {
      match.department = department;
    }

    if (status) {
      match.status = status;
    }

    // Aggregation pipeline for employees with counts
    const pipeline: PipelineStage[] = [
      { $match: match },
      { $sort: { lastName: 1 as const, firstName: 1 as const } },
      {
        $facet: {
          employees: [
            { $skip: skip },
            { $limit: limit },
            {
              $addFields: {
                id: { $toString: "$_id" },
                notesCount: { $size: { $ifNull: ["$notes", []] } },
              },
            },
            {
              $project: {
                id: 1,
                employeeId: 1,
                firstName: 1,
                lastName: 1,
                email: 1,
                department: 1,
                jobTitle: 1,
                managerName: 1,
                hireDate: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                notesCount: 1,
              },
            },
          ],
          total: [{ $count: "count" }],
        },
      },
    ];

    const [result] = await Employee.aggregate(pipeline);
    const employees = result.employees as Record<string, unknown>[];
    const total = (result.total as { count: number }[])[0]?.count ?? 0;

    // Get document counts for returned employees
    const employeeIds = employees.map((e) => e.id as string);
    const docCounts = await TrackedDocument.aggregate([
      { $match: { employeeId: { $in: employeeIds } } },
      { $group: { _id: "$employeeId", count: { $sum: 1 } } },
    ]);

    const docCountMap: Record<string, number> = {};
    for (const row of docCounts) {
      docCountMap[row._id] = row.count;
    }

    const employeesWithCounts = employees.map((e) => ({
      ...e,
      documentsCount: docCountMap[e.id as string] ?? 0,
    }));

    return NextResponse.json({
      employees: employeesWithCounts,
      total,
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
