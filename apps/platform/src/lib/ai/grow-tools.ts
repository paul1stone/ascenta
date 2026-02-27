/**
 * Grow AI Tools
 * Tools for the Grow module: goal creation, performance notes, and status queries.
 */

import { z } from "zod";
import { tool } from "ai";
import { connectDB } from "@ascenta/db";
import { Goal } from "@ascenta/db/goal-schema";
import { PerformanceNote } from "@ascenta/db/performance-note-schema";
import { CheckIn } from "@ascenta/db/checkin-schema";
import { Employee } from "@ascenta/db/employee-schema";

// ============================================================================
// Helper: find employee by name (regex search on firstName/lastName)
// ============================================================================

async function findEmployeeByName(name: string) {
  const parts = name.trim().split(/\s+/);
  let query;

  if (parts.length >= 2) {
    // Search by first + last name
    query = {
      firstName: { $regex: new RegExp(parts[0], "i") },
      lastName: { $regex: new RegExp(parts.slice(1).join(" "), "i") },
    };
  } else {
    // Single term — search either field
    const pattern = new RegExp(parts[0], "i");
    query = {
      $or: [{ firstName: pattern }, { lastName: pattern }],
    };
  }

  return Employee.findOne(query);
}

// ============================================================================
// createGoalTool
// ============================================================================

export const createGoalTool = tool({
  description:
    "Create a performance goal for an employee. Use this when a manager or HR wants to set a new goal.",
  inputSchema: z.object({
    statement: z.string().describe("The goal statement"),
    measure: z
      .string()
      .describe("How success will be measured for this goal"),
    type: z
      .enum(["team", "role", "individual"])
      .optional()
      .default("individual")
      .describe("Goal type: team, role, or individual"),
    employeeName: z
      .string()
      .optional()
      .describe("Name of the employee who owns this goal"),
    startDate: z
      .string()
      .optional()
      .describe("Goal start date in ISO format (YYYY-MM-DD)"),
    endDate: z
      .string()
      .optional()
      .describe("Goal end date in ISO format (YYYY-MM-DD)"),
  }),
  execute: async ({ statement, measure, type, employeeName, startDate, endDate }) => {
    try {
      await connectDB();

      let ownerId: string | null = null;

      if (employeeName) {
        const employee = await findEmployeeByName(employeeName);
        if (!employee) {
          return {
            success: false,
            message: `Could not find an employee matching "${employeeName}". Please verify the name and try again.`,
          };
        }
        ownerId = String(employee._id);
      }

      if (!ownerId) {
        return {
          success: false,
          message:
            "An employee name is required to create a goal. Please provide the employee name.",
        };
      }

      const goalData: Record<string, unknown> = {
        statement,
        measure,
        type: type ?? "individual",
        owner: ownerId,
        createdBy: ownerId,
        status: "active",
      };

      if (startDate || endDate) {
        goalData.timeperiod = {
          ...(startDate ? { start: new Date(startDate) } : {}),
          ...(endDate ? { end: new Date(endDate) } : {}),
        };
      }

      const goal = await Goal.create(goalData);

      return {
        success: true,
        goalId: String(goal._id),
        message: `Goal created successfully for ${employeeName}: "${statement}"`,
        goal: {
          id: String(goal._id),
          statement,
          measure,
          type: type ?? "individual",
          status: "active",
        },
      };
    } catch (error) {
      console.error("Error creating goal:", error);
      return {
        success: false,
        message: "Failed to create goal. Please try again.",
      };
    }
  },
});

// ============================================================================
// addPerformanceNoteTool
// ============================================================================

export const addPerformanceNoteTool = tool({
  description:
    "Add a performance note (observation, feedback, coaching, recognition, or concern) for an employee.",
  inputSchema: z.object({
    employeeName: z
      .string()
      .describe("Name of the employee this note is about"),
    type: z
      .enum(["observation", "feedback", "coaching", "recognition", "concern"])
      .describe("Type of performance note"),
    content: z.string().describe("The note content"),
    context: z
      .string()
      .optional()
      .describe("Additional context for the note (e.g., meeting, project)"),
  }),
  execute: async ({ employeeName, type, content, context }) => {
    try {
      await connectDB();

      const employee = await findEmployeeByName(employeeName);
      if (!employee) {
        return {
          success: false,
          message: `Could not find an employee matching "${employeeName}". Please verify the name and try again.`,
        };
      }

      const employeeId = String(employee._id);

      const noteData: Record<string, unknown> = {
        employee: employeeId,
        author: employeeId, // Default author to the employee; adjust when auth is available
        type,
        content,
        visibility: "manager_only",
      };

      if (context) {
        noteData.context = context;
      }

      const note = await PerformanceNote.create(noteData);

      return {
        success: true,
        noteId: String(note._id),
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} note added for ${employeeName}.`,
        note: {
          id: String(note._id),
          type,
          content,
          context: context ?? null,
        },
      };
    } catch (error) {
      console.error("Error adding performance note:", error);
      return {
        success: false,
        message: "Failed to add performance note. Please try again.",
      };
    }
  },
});

// ============================================================================
// getGrowStatusTool
// ============================================================================

export const getGrowStatusTool = tool({
  description:
    "Get Grow module metrics: goal counts, check-in stats, and recent performance note activity.",
  inputSchema: z.object({
    scope: z
      .enum(["all", "team", "individual"])
      .optional()
      .default("all")
      .describe("Scope of metrics to return"),
  }),
  execute: async () => {
    try {
      await connectDB();

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const now = new Date();

      const [
        totalGoals,
        activeGoals,
        totalCheckIns,
        completedCheckIns,
        overdueCheckIns,
        recentNotes,
      ] = await Promise.all([
        Goal.countDocuments(),
        Goal.countDocuments({ status: "active" }),
        CheckIn.countDocuments(),
        CheckIn.countDocuments({ status: "completed" }),
        CheckIn.countDocuments({
          status: "scheduled",
          scheduledDate: { $lt: now },
        }),
        PerformanceNote.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      ]);

      return {
        success: true,
        metrics: {
          goals: {
            total: totalGoals,
            active: activeGoals,
          },
          checkIns: {
            total: totalCheckIns,
            completed: completedCheckIns,
            overdue: overdueCheckIns,
          },
          performanceNotes: {
            last30Days: recentNotes,
          },
        },
        message: `Grow metrics: ${activeGoals} active goals, ${completedCheckIns} completed check-ins, ${overdueCheckIns} overdue, ${recentNotes} notes in last 30 days.`,
      };
    } catch (error) {
      console.error("Error fetching grow status:", error);
      return {
        success: false,
        message: "Failed to fetch Grow metrics. Please try again.",
        metrics: null,
      };
    }
  },
});
