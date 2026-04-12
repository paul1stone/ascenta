/**
 * Strategy Breakdown AI tools
 * Enables conversational strategy breakdown and brief generation via Compass
 */

import { z } from "zod";
import { tool } from "ai";
import { connectDB } from "@ascenta/db";
import { StrategyGoal } from "@ascenta/db/strategy-goal-schema";
import { CompanyFoundation } from "@ascenta/db/foundation-schema";
import { Employee } from "@ascenta/db/employee-schema";
import { Goal } from "@ascenta/db/goal-schema";
import { getEmployeeByEmployeeId } from "@ascenta/db/employees";
import {
  WORKING_DOC_PREFIX,
  WORKING_DOC_SUFFIX,
} from "./workflow-constants";
import { getTranslationForEmployee } from "./translation-lookup";

// ---------------------------------------------------------------------------
// getStrategyBreakdown — fetch all strategy context for the AI
// ---------------------------------------------------------------------------

export const getStrategyBreakdownTool = tool({
  description:
    "Fetch company and department strategy goals, foundation (mission/vision/values), and user context to enable a conversational strategy breakdown. Call this first when the user wants to understand company or department strategy.\n\nWhen translatedContributions, translatedBehaviors, and translatedDecisionRights are available in the response, use them as the authoritative source for role-based language rather than synthesizing from raw strategy goals. Present the translated contribution for each priority, the behavioral expectations, and the decision rights. If no translation exists, fall back to the current behavior of presenting raw strategy data and synthesizing relevance.",
  inputSchema: z.object({
    employeeName: z.string().describe("Full name of the employee to contextualize the breakdown for"),
    employeeId: z.string().describe("Employee ID (e.g. EMP1001) from getEmployeeInfo"),
    includePersonalGoals: z
      .boolean()
      .optional()
      .default(false)
      .describe("Whether to also fetch the user's personal goals from Grow for alignment context"),
  }),
  execute: async (params) => {
    await connectDB();

    // Fetch employee details
    const employee = await getEmployeeByEmployeeId(params.employeeId);
    if (!employee) {
      return {
        success: false,
        message: `Could not find employee with ID ${params.employeeId}.`,
      };
    }

    const { department, jobTitle } = employee;

    // Determine if manager (has direct reports)
    const directReportCount = await Employee.countDocuments({ managerId: employee.id });
    const isManager = directReportCount > 0;

    // Fetch foundation (published MVV)
    const foundation = await CompanyFoundation.findOne({ status: "published" }).lean();

    // Fetch company-wide strategy goals (non-archived)
    const companyGoals = await StrategyGoal.find({
      scope: "company",
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1, createdAt: -1 })
      .lean();

    // Fetch department strategy goals
    const departmentGoals = await StrategyGoal.find({
      scope: "department",
      department,
      status: { $ne: "archived" },
    })
      .sort({ horizon: 1, createdAt: -1 })
      .lean();

    // Optionally fetch personal goals
    let personalGoals: unknown[] = [];
    if (params.includePersonalGoals) {
      personalGoals = await Goal.find({
        owner: employee.id,
        status: { $ne: "completed" },
      })
        .sort({ createdAt: -1 })
        .lean();
    }

    // Load translation for role-based language
    let translatedContributions: { strategyGoalTitle: string; roleContribution: string; outcomes: string[] }[] | null = null;
    let translatedBehaviors: { valueName: string; expectation: string }[] | null = null;
    let translatedDecisionRights: { canDecide: string[]; canRecommend: string[]; mustEscalate: string[] } | null = null;

    try {
      const translation = await getTranslationForEmployee(department, jobTitle);
      if (translation) {
        translatedContributions = translation.contributions.map((c) => ({
          strategyGoalTitle: c.strategyGoalTitle,
          roleContribution: c.roleContribution,
          outcomes: c.outcomes,
        }));
        translatedBehaviors = translation.behaviors;
        translatedDecisionRights = translation.decisionRights;
      }
    } catch {
      // silent — fall back to raw data
    }

    return {
      success: true,
      employee: {
        name: params.employeeName,
        employeeId: params.employeeId,
        department,
        jobTitle,
        isManager,
        directReportCount,
      },
      foundation: foundation
        ? {
            mission: (foundation as Record<string, unknown>).mission,
            vision: (foundation as Record<string, unknown>).vision,
            values: (foundation as Record<string, unknown>).values,
          }
        : null,
      companyGoals: (companyGoals as Record<string, unknown>[]).map((g) => ({
        title: g.title,
        description: g.description,
        horizon: g.horizon,
        status: g.status,
        successMetrics: g.successMetrics,
        timePeriod: g.timePeriod,
      })),
      departmentGoals: (departmentGoals as Record<string, unknown>[]).map((g) => ({
        title: g.title,
        description: g.description,
        horizon: g.horizon,
        status: g.status,
        successMetrics: g.successMetrics,
        timePeriod: g.timePeriod,
      })),
      personalGoals: (personalGoals as Record<string, unknown>[]).map((g) => ({
        title: g.title,
        description: g.description,
        category: g.category,
        status: g.status,
        alignment: g.alignment,
      })),
      translatedContributions,
      translatedBehaviors,
      translatedDecisionRights,
      message: `Retrieved strategy context for ${params.employeeName} (${department}). ${companyGoals.length} company goals, ${departmentGoals.length} department goals.`,
    };
  },
});

// ---------------------------------------------------------------------------
// generateStrategyBrief — generate a downloadable strategy brief document
// ---------------------------------------------------------------------------

export const generateStrategyBriefTool = tool({
  description:
    "Generate a strategy brief document and open it in the working document panel. Call this when the user wants a downloadable summary of the strategy breakdown. When translatedContributions are available from getStrategyBreakdown, use them as the authoritative source for role-specific language rather than synthesizing from raw goal data. You must synthesize the content — do not just repeat raw data.",
  inputSchema: z.object({
    employeeName: z.string().describe("Employee name for the document header"),
    department: z.string().describe("Department name for the document header"),
    companySummary: z
      .string()
      .describe("AI-written 2-3 sentence summary of company mission and strategic direction"),
    companyGoals: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          horizon: z.string(),
          status: z.string(),
        }),
      )
      .describe("Company strategy goals to include in the brief"),
    departmentGoals: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          horizon: z.string(),
          status: z.string(),
        }),
      )
      .describe("Department strategy goals to include in the brief"),
    relevance: z
      .string()
      .describe(
        "AI-written 'What This Means For You' narrative — 3-5 sentences contextualizing strategy to this person's role and department",
      ),
    translatedContributions: z
      .array(
        z.object({
          strategyGoalTitle: z.string(),
          roleContribution: z.string(),
          outcomes: z.array(z.string()),
        }),
      )
      .optional()
      .describe("Translated role contributions from published strategy translations — use as authoritative source when available"),
  }),
  execute: async (params) => {
    const sections = {
      companySummary: params.companySummary,
      companyGoals: params.companyGoals,
      departmentGoals: params.departmentGoals,
      relevance: params.relevance,
      translatedContributions: params.translatedContributions ?? null,
    };

    const workingDocPayload = {
      action: "open_working_document" as const,
      workflowType: "strategy-breakdown" as const,
      runId: crypto.randomUUID(),
      employeeId: null,
      employeeName: params.employeeName,
      prefilled: {
        employeeName: params.employeeName,
        department: params.department,
        generatedAt: new Date().toISOString(),
        sections,
      },
    };

    return {
      success: true,
      message: `I've generated your strategy brief. You can review it in the panel and download it as a PDF.`,
      workingDocBlock: `${WORKING_DOC_PREFIX}${JSON.stringify(workingDocPayload)}${WORKING_DOC_SUFFIX}`,
    };
  },
});
