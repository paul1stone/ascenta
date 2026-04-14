// apps/platform/src/app/api/grow/reviews/route.ts

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { createReviewSchema } from "@/lib/validations/performance-review";
import { parseTimePeriod } from "@/lib/ai/grow-tools";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const managerId = searchParams.get("managerId");
    const periodLabel = searchParams.get("period");
    const employeeObjectId = searchParams.get("employeeObjectId");

    if (employeeObjectId) {
      // Employee view: reviews where this employee is the subject
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const employeeReviews = await PerformanceReview.find({ employee: employeeObjectId })
        .sort({ "reviewPeriod.end": -1 })
        .lean() as any[];

      return NextResponse.json({
        success: true,
        reviews: employeeReviews.map((r) => ({
          id: String(r._id),
          employeeName: r.employeeName as string,
          reviewPeriod: typeof r.reviewPeriod === "string"
            ? r.reviewPeriod
            : (r.reviewPeriod?.label as string | undefined) ?? "",
          reviewType: (r.reviewType as string | undefined) ?? "custom",
          selfAssessmentStatus: (r.selfAssessment?.status as string | undefined) ?? "not_started",
        })),
      });
    }

    if (!managerId) {
      return NextResponse.json(
        { success: false, error: "managerId or employeeObjectId is required" },
        { status: 400 },
      );
    }

    // Find manager by employeeId string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manager = await Employee.findOne({ employeeId: managerId }).lean() as any;
    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 },
      );
    }

    // Discover direct reports via goals (same pattern as /api/grow/status)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const managedGoals = await Goal.find({ manager: manager._id }).lean() as any[];
    const directReportIds = [
      ...new Set(managedGoals.map((g) => String(g.owner))),
    ];

    // Get employee details
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const directReports = await Employee.find({
      _id: { $in: directReportIds },
    }).lean() as any[];

    // Get existing reviews for this manager
    const reviewFilter: Record<string, unknown> = { manager: manager._id };
    if (periodLabel) {
      reviewFilter["reviewPeriod.label"] = periodLabel;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviews = await PerformanceReview.find(reviewFilter)
      .sort({ "reviewPeriod.end": -1 })
      .lean() as any[];

    // Build review map by employee ID
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const reviewMap = new Map<string, any>();
    for (const review of reviews) {
      const key = `${String(review.employee)}-${review.reviewPeriod.label}`;
      reviewMap.set(key, review);
    }

    // Count goals per employee in the period
    const goalCountMap = new Map<string, number>();
    for (const goal of managedGoals) {
      const ownerId = String(goal.owner);
      goalCountMap.set(ownerId, (goalCountMap.get(ownerId) || 0) + 1);
    }

    // Build response: one entry per direct report
    const reviewEntries = directReports.map((emp) => {
      const empId = String(emp._id);
      const key = periodLabel ? `${empId}-${periodLabel}` : null;
      const review = key ? reviewMap.get(key) : null;

      return {
        employeeId: emp.employeeId,
        employeeObjectId: empId,
        employeeName: `${emp.firstName} ${emp.lastName}`,
        department: emp.department,
        goalCount: goalCountMap.get(empId) || 0,
        status: review ? review.status : "not_started",
        currentStep: review ? review.currentStep : null,
        reviewId: review ? String(review._id) : null,
        selfAssessmentStatus: review ? (review.selfAssessment?.status as string | undefined) ?? "not_started" : "not_started",
        managerAssessmentStatus: review ? (review.managerAssessment?.status as string | undefined) ?? "not_started" : "not_started",
      };
    });

    // Aggregates
    const aggregates = {
      directReports: directReports.length,
      notStarted: reviewEntries.filter((r) => r.status === "not_started").length,
      inProgress: reviewEntries.filter((r) =>
        ["in_progress", "draft_complete"].includes(r.status),
      ).length,
      finalized: reviewEntries.filter((r) =>
        ["finalized", "shared"].includes(r.status),
      ).length,
    };

    return NextResponse.json({
      success: true,
      reviews: reviewEntries,
      aggregates,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Look up employee
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const employee = await Employee.findOne({
      employeeId: data.employeeId,
    }).lean() as any;
    if (!employee) {
      return NextResponse.json(
        { success: false, error: "Employee not found" },
        { status: 404 },
      );
    }

    // Look up manager
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const manager = await Employee.findOne({
      employeeId: data.managerId,
    }).lean() as any;
    if (!manager) {
      return NextResponse.json(
        { success: false, error: "Manager not found" },
        { status: 404 },
      );
    }

    // Parse period
    const timePeriod = parseTimePeriod(
      data.reviewPeriod,
      data.customStartDate,
      data.customEndDate,
    );

    // Check for existing review
    const existing = await PerformanceReview.findOne({
      employee: employee._id,
      manager: manager._id,
      "reviewPeriod.label": data.reviewPeriod,
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "A review already exists for this employee and period" },
        { status: 409 },
      );
    }

    const review = await PerformanceReview.create({
      employee: employee._id,
      manager: manager._id,
      reviewPeriod: {
        start: timePeriod.start,
        end: timePeriod.end,
        label: data.reviewPeriod,
      },
      status: "in_progress",
      currentStep: "contributions",
    });

    return NextResponse.json({
      success: true,
      reviewId: String(review._id),
      message: `Performance review created for ${data.employeeName}`,
    });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create review" },
      { status: 500 },
    );
  }
}
