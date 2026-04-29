/**
 * Job Description AI tools — Compass interview to build or refine a JD.
 */

import { z } from "zod";
import { tool } from "ai";
import mongoose from "mongoose";
import { connectDB } from "@ascenta/db";
import { JobDescription } from "@ascenta/db/job-description-schema";
import {
  LEVEL_OPTIONS,
  EMPLOYMENT_TYPE_OPTIONS,
  STATUS_OPTIONS,
  LEVEL_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  STATUS_LABELS,
} from "@ascenta/db/job-description-constants";
import { WORKING_DOC_PREFIX, WORKING_DOC_SUFFIX } from "./workflow-constants";

const jdInputShape = z.object({
  jdId: z.string().optional(),
  title: z.string().describe("Job title, e.g. 'Staff Software Engineer'"),
  department: z.string().describe("Department name"),
  level: z.enum(LEVEL_OPTIONS),
  employmentType: z.enum(EMPLOYMENT_TYPE_OPTIONS),
  roleSummary: z.string().describe("3-5 sentence summary of what this role exists to do"),
  coreResponsibilities: z.array(z.string()).min(1).describe("Bullet list of core responsibilities"),
  requiredQualifications: z.array(z.string()).min(1).describe("Required qualifications bullets"),
  preferredQualifications: z.array(z.string()).describe("Preferred qualifications bullets (can be empty)"),
  competencies: z.array(z.string()).min(1).describe("Key competencies bullets"),
  status: z.enum(STATUS_OPTIONS).default("published"),
});

// ---------------------------------------------------------------------------
// startJobDescriptionWorkflowTool — interview, handles new + refine
// ---------------------------------------------------------------------------

export const startJobDescriptionWorkflowTool = tool({
  description: `Start a Job Description compass session. If jdId is provided, this is REFINE mode (load existing JD); otherwise NEW mode (start fresh).

After calling this tool, walk the user through the JD section-by-section, ONE QUESTION AT A TIME:

1. Title (e.g., "Staff Software Engineer")
2. Department
3. Level — present an [ASCENTA_OPTIONS] block with the level options from the tool response
4. Employment type — [ASCENTA_OPTIONS] with the employment type options
5. Role summary (3-5 sentences — the "what this role exists to do")
6. Core responsibilities — collect bullets one at a time. After each, ask "Any more?" Stop when the user says no.
7. Required qualifications — same one-at-a-time bullet pattern
8. Preferred qualifications — same pattern; user can skip with "none"
9. Competencies — same one-at-a-time bullet pattern (≥1)

In REFINE mode, for EACH section:
- Restate the existing value or list.
- Present [ASCENTA_OPTIONS] with ["Keep it", "Refine it", "Replace it"].
- "Refine" → ask follow-ups; "Replace" → ask the question fresh; "Keep" → move on.

When all sections are covered, call openJobDescriptionDocument with the full payload (including jdId if refining).

RULES:
- One question at a time.
- Use [ASCENTA_OPTIONS] for level, employment type, and keep/refine/replace prompts.
- Don't enumerate the option list as text in the same message.`,
  inputSchema: z.object({
    jdId: z.string().optional().describe(
      "ObjectId of an existing job description to refine. Omit for a new JD.",
    ),
  }),
  execute: async ({ jdId }) => {
    const levelOptions = [...LEVEL_OPTIONS];
    const employmentTypeOptions = [...EMPLOYMENT_TYPE_OPTIONS];
    const statusOptions = [...STATUS_OPTIONS];

    if (!jdId) {
      return {
        success: true,
        existing: null,
        levelOptions,
        employmentTypeOptions,
        statusOptions,
        levelLabels: LEVEL_LABELS,
        employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
        statusLabels: STATUS_LABELS,
        message: "Starting a new job description.",
      };
    }

    if (!mongoose.isValidObjectId(jdId)) {
      return {
        success: false,
        existing: null,
        levelOptions,
        employmentTypeOptions,
        statusOptions,
        levelLabels: LEVEL_LABELS,
        employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
        statusLabels: STATUS_LABELS,
        message: "Invalid job description ID.",
      };
    }

    await connectDB();
    const jd = await JobDescription.findById(jdId).lean<{
      _id: unknown;
      title: string;
      department: string;
      level: string;
      employmentType: string;
      roleSummary: string;
      coreResponsibilities: string[];
      requiredQualifications: string[];
      preferredQualifications: string[];
      competencies: string[];
      status: string;
    }>();
    if (!jd) {
      return {
        success: false,
        existing: null,
        levelOptions,
        employmentTypeOptions,
        statusOptions,
        levelLabels: LEVEL_LABELS,
        employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
        statusLabels: STATUS_LABELS,
        message: "Job description not found.",
      };
    }

    return {
      success: true,
      existing: {
        jdId: String(jd._id),
        title: jd.title,
        department: jd.department,
        level: jd.level,
        employmentType: jd.employmentType,
        roleSummary: jd.roleSummary,
        coreResponsibilities: jd.coreResponsibilities ?? [],
        requiredQualifications: jd.requiredQualifications ?? [],
        preferredQualifications: jd.preferredQualifications ?? [],
        competencies: jd.competencies ?? [],
        status: jd.status,
      },
      levelOptions,
      employmentTypeOptions,
      statusOptions,
      levelLabels: LEVEL_LABELS,
      employmentTypeLabels: EMPLOYMENT_TYPE_LABELS,
      statusLabels: STATUS_LABELS,
      message: `Refining "${jd.title}".`,
    };
  },
});

// ---------------------------------------------------------------------------
// openJobDescriptionDocumentTool — emits the [ASCENTA_WORKING_DOC] block
// ---------------------------------------------------------------------------

export const openJobDescriptionDocumentTool = tool({
  description:
    "Open the Job Description working document with all fields prefilled. Call at the END of the interview. Pass jdId iff refining an existing JD.",
  inputSchema: jdInputShape,
  execute: async (params) => {
    const mode = params.jdId ? "edit" : "create";
    const { jdId, ...rest } = params;
    const payload = {
      action: "open_working_document" as const,
      workflowType: "create-job-description" as const,
      runId: "",
      employeeId: "",
      employeeName: "",
      prefilled: {
        ...rest,
        mode,
        ...(jdId ? { jdId } : {}),
      },
    };

    return {
      success: true,
      message:
        mode === "edit"
          ? `Opened "${params.title}" for review.`
          : `Opened the new job description for review.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(payload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
