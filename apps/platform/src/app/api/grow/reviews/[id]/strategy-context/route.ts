/**
 * GET /api/grow/reviews/[id]/strategy-context
 *
 * Returns the strategic priorities context an employee ladders to, for use
 * in the v2 manager-assessment drafting sidebar.
 *
 * Required by docs/reqs/perf-reviews.md Step 4 — AI-Assisted Review Drafting:
 *   "Sidebar displays which strategic priorities the employee ladders to
 *    during drafting"
 */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { getTranslationForEmployee } from "@/lib/ai/translation-lookup";

interface StrategyGoalSummary {
  id: string;
  title: string;
  horizon: string | null;
  department: string | null;
  successMetrics: string | null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const review = await PerformanceReview.findById(id).lean() as
      | Record<string, unknown>
      | null;
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    const employeeRef = review.employee as unknown as string | undefined;
    const employee = employeeRef
      ? (await Employee.findById(employeeRef)
          .select("firstName lastName department jobTitle")
          .lean()) as Record<string, unknown> | null
      : null;

    const department = (employee?.department as string | undefined) ?? "";
    const jobTitle = (employee?.jobTitle as string | undefined) ?? "";

    // Foundation (mission, vision, values) — the cultural anchor.
    // Prefer the published version; fall back to any draft if none is
    // published yet.
    const foundation =
      ((await CompanyFoundation.findOne({ status: "published" })
        .sort({ publishedAt: -1 })
        .lean()) as Record<string, unknown> | null) ??
      ((await CompanyFoundation.findOne({})
        .sort({ updatedAt: -1 })
        .lean()) as Record<string, unknown> | null);

    // Employee's in-scope strategy goals — prefer the snapshot on the review
    // (captures what was true at review-creation time), fall back to the
    // employee's department + all-scope goals.
    const snapshot = Array.isArray(review.strategyGoals)
      ? (review.strategyGoals as Array<Record<string, unknown>>)
      : [];
    let strategyGoals: StrategyGoalSummary[];
    if (snapshot.length > 0) {
      const ids = snapshot
        .map((g) => g.strategyGoalId)
        .filter((v): v is string => Boolean(v));
      const full = (await StrategyGoal.find({ _id: { $in: ids } })
        .select("title horizon department successMetrics")
        .lean()) as Array<Record<string, unknown>>;
      const byId = new Map(full.map((g) => [String(g._id), g]));
      strategyGoals = snapshot.map((g) => {
        const doc = byId.get(String(g.strategyGoalId));
        return {
          id: String(g.strategyGoalId),
          title:
            (doc?.title as string | undefined) ??
            (g.title as string | undefined) ??
            "",
          horizon:
            (doc?.horizon as string | null | undefined) ??
            (g.horizon as string | null | undefined) ??
            null,
          department: (doc?.department as string | null | undefined) ?? null,
          successMetrics:
            (doc?.successMetrics as string | null | undefined) ?? null,
        };
      });
    } else {
      const goals = (await StrategyGoal.find({
        $or: [{ department }, { department: null }, { department: "" }],
        status: { $ne: "archived" },
      })
        .select("title horizon department successMetrics")
        .sort({ horizon: 1 })
        .lean()) as Array<Record<string, unknown>>;
      strategyGoals = goals.map((g) => ({
        id: String(g._id),
        title: (g.title as string | undefined) ?? "",
        horizon: (g.horizon as string | null | undefined) ?? null,
        department: (g.department as string | null | undefined) ?? null,
        successMetrics:
          (g.successMetrics as string | null | undefined) ?? null,
      }));
    }

    const translation =
      department && jobTitle
        ? await getTranslationForEmployee(department, jobTitle)
        : null;

    return NextResponse.json({
      success: true,
      foundation: foundation
        ? {
            mission: (foundation.mission as string | undefined) ?? "",
            vision: (foundation.vision as string | undefined) ?? "",
            values: (foundation.values as string | undefined) ?? "",
          }
        : null,
      employee: employee
        ? {
            id: String(employee._id),
            department,
            jobTitle,
          }
        : null,
      strategyGoals,
      roleTranslation: translation,
    });
  } catch (error) {
    console.error("Error fetching strategy context:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch strategy context" },
      { status: 500 },
    );
  }
}
