import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@ascenta/db";
import { PerformanceReview } from "@ascenta/db/performance-review-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { renderArtifactAsHtml, formatDate } from "@/lib/workflows/artifacts";
import type { ArtifactTemplateDefinition } from "@/lib/workflows/types";

const REVIEW_TEMPLATE: ArtifactTemplateDefinition = {
  id: "performance-review",
  name: "Performance Review",
  type: "memo",
  exportFormats: ["pdf"],
  sections: [
    {
      key: "header",
      title: "Performance Review",
      locked: true,
      content: "",
    },
    {
      key: "summary",
      title: "Summary",
      locked: false,
    },
    {
      key: "strengthsAndImpact",
      title: "Strengths & Impact",
      locked: false,
    },
    {
      key: "areasForGrowth",
      title: "Areas for Growth",
      locked: false,
    },
    {
      key: "strategicAlignment",
      title: "Strategic Alignment",
      locked: false,
    },
    {
      key: "overallAssessment",
      title: "Overall Assessment",
      locked: false,
    },
    {
      key: "signoff",
      title: "Manager Signoff",
      locked: true,
      content: "",
    },
  ],
};

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await connectDB();
    const { id } = await params;

    const review = await PerformanceReview.findById(id).lean();
    if (!review) {
      return NextResponse.json(
        { success: false, error: "Review not found" },
        { status: 404 },
      );
    }

    if (review.status !== "finalized" && review.status !== "shared") {
      return NextResponse.json(
        { success: false, error: "Review must be finalized before generating PDF" },
        { status: 400 },
      );
    }

    const employee = await Employee.findById(review.employee).lean();
    const employeeName = employee
      ? `${employee.firstName} ${employee.lastName}`
      : "Unknown Employee";

    const final = review.finalDocument;

    // Build sections map for artifact renderer
    const sections: Record<string, string> = {
      header: [
        `**Employee:** ${employeeName}`,
        `**Department:** ${employee?.department ?? "N/A"}`,
        `**Review Period:** ${review.reviewPeriod.label} (${formatDate(review.reviewPeriod.start)} — ${formatDate(review.reviewPeriod.end)})`,
        `**Date:** ${formatDate(new Date())}`,
      ].join("\n\n"),
      summary: final.summary || "",
      strengthsAndImpact: final.strengthsAndImpact || "",
      areasForGrowth: final.areasForGrowth || "",
      strategicAlignment: final.strategicAlignment || "",
      overallAssessment: final.overallAssessment || "",
      signoff: [
        `**Manager:** ${final.managerSignoff?.name || "N/A"}`,
        `**Date:** ${final.managerSignoff?.at ? formatDate(final.managerSignoff.at) : "N/A"}`,
      ].join("\n\n"),
    };

    const html = renderArtifactAsHtml(REVIEW_TEMPLATE, sections);

    // Wrap in a printable HTML document
    const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Performance Review — ${employeeName}</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1a1a1a; line-height: 1.6; }
    .artifact-document { border: 1px solid #e0e0e0; padding: 40px; border-radius: 8px; }
    .section-title { font-size: 18px; font-weight: 600; margin-top: 24px; margin-bottom: 8px; color: #0c1e3d; border-bottom: 1px solid #e0e0e0; padding-bottom: 6px; }
    .section-content { font-size: 14px; }
    .section-content p { margin: 8px 0; }
    .section-content ul, .section-content ol { margin: 8px 0; padding-left: 24px; }
    .artifact-section.locked { background: #f8fafc; padding: 12px 16px; border-radius: 6px; margin: 16px 0; }
    @media print { body { margin: 0; } .artifact-document { border: none; padding: 0; } }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

    return new NextResponse(fullHtml, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `attachment; filename="performance-review-${employeeName.replace(/\s+/g, "-").toLowerCase()}-${review.reviewPeriod.label}.html"`,
      },
    });
  } catch (error) {
    console.error("Error generating review PDF:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate review document" },
      { status: 500 },
    );
  }
}
