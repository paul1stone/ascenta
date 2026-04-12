import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { StrategyTranslation } from "@ascenta/db/strategy-translation-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { generateTranslationForDepartment, checkTranslationStalenessBatch } from "@/lib/ai/translation-engine";

// ============================================================================
// GET — List translations
// ============================================================================

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");

    const filter: Record<string, unknown> = {};
    if (department) filter.department = department;
    if (status) {
      filter.status = status;
    } else if (!searchParams.has("includeArchived")) {
      filter.status = { $ne: "archived" };
    }

    const translations = await StrategyTranslation.find(filter)
      .sort({ department: 1, version: -1 })
      .lean();

    // Batch staleness check (2 DB queries total instead of N*3)
    const checkable = translations.filter(
      (t) => {
        const s = (t as Record<string, unknown>).status;
        return s === "published" || s === "draft";
      },
    ) as Record<string, unknown>[];
    const stalenessMap = checkable.length > 0
      ? await checkTranslationStalenessBatch(checkable)
      : new Map<string, { isStale: boolean; reasons: string[] }>();

    const results = translations.map((t) => {
      const doc = t as Record<string, unknown>;
      const id = String(doc._id);
      const staleness = stalenessMap.get(id) ?? { isStale: false, reasons: [] };
      return {
        ...doc,
        id,
        _id: undefined,
        __v: undefined,
        isStale: staleness.isStale,
        stalenessReasons: staleness.reasons,
      };
    });

    return NextResponse.json({ success: true, translations: results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translations GET error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch translations" },
      { status: 500 },
    );
  }
}

// ============================================================================
// POST — Trigger generation for a department (or all)
// ============================================================================

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const { department } = body as { department: string };

    if (!department) {
      return NextResponse.json(
        { success: false, error: "department is required" },
        { status: 400 },
      );
    }

    if (department === "all") {
      const departments = await Employee.distinct("department", {
        status: "active",
      });

      const results = [];
      for (const dept of departments) {
        if (!dept) continue;
        try {
          const id = await generateTranslationForDepartment(dept as string);
          results.push({ department: dept, translationId: id, success: true });
        } catch (err) {
          results.push({
            department: dept,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          });
        }
      }

      return NextResponse.json({ success: true, results });
    }

    const translationId = await generateTranslationForDepartment(department);
    return NextResponse.json({
      success: true,
      translationId,
      message: `Translation generated for ${department}. Review and publish when ready.`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Strategy translations POST error:", message);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
