import { z } from "zod";
import { tool } from "ai";
import { searchKnowledgeBase } from "@/lib/rag/search";
import { searchEmployees } from "@ascenta/db/employees";
import {
  startCorrectiveActionTool,
  updateWorkflowFieldTool,
  generateCorrectiveActionDocumentTool,
  generateWorkflowFollowUpTool,
} from "./workflow-tools";
import {
  startGoalWorkflowTool,
  openGoalDocumentTool,
  startCheckInTool,
  startPerformanceNoteTool,
  completeGrowWorkflowTool,
} from "./grow-tools";
import {
  startMyRoleWorkflowTool,
  openMyRoleDocumentTool,
  suggestFromJDTool,
} from "./profile-tools";
import {
  startJobDescriptionWorkflowTool,
  openJobDescriptionDocumentTool,
} from "./job-description-tools";

/**
 * Tool Definitions
 * Define tools that the AI can use during conversations
 */

/**
 * Search Knowledge Base Tool
 * Allows the AI to search the RAG knowledge base
 */
export const searchKnowledgeBaseTool = tool({
  description: "Search the HR knowledge base for relevant documents and policies. Use this when you need to find specific information about HR processes, policies, or procedures.",
  inputSchema: z.object({
    query: z.string().describe("The search query to find relevant documents"),
    limit: z.number().optional().default(5).describe("Maximum number of results to return"),
  }),
  execute: async ({ query, limit }) => {
    try {
      const results = await searchKnowledgeBase(query, { limit });
      
      if (results.length === 0) {
        return {
          found: false,
          message: `No documents found matching: "${query}"`,
          results: [],
        };
      }

      return {
        found: true,
        message: `Found ${results.length} relevant document(s)`,
        results: results.map((r) => ({
          content: r.content,
          source: r.documentSource || r.documentTitle || "Unknown",
          similarity: Math.round(r.similarity * 100),
        })),
      };
    } catch (error) {
      console.error("Knowledge base search error:", error);
      return {
        found: false,
        message: "Error searching knowledge base",
        results: [],
      };
    }
  },
});

/**
 * Create Task Tool
 * Allows the AI to create HR workflow tasks
 */
export const createTaskTool = tool({
  description: "Create a new HR task or workflow item. Use this when the user wants to schedule or track an HR activity.",
  inputSchema: z.object({
    title: z.string().describe("Title of the task"),
    description: z.string().describe("Detailed description of the task"),
    priority: z.enum(["low", "medium", "high", "urgent"]).describe("Task priority level"),
    dueDate: z.string().optional().describe("Due date in ISO format (YYYY-MM-DD)"),
    assignee: z.string().optional().describe("User ID or name to assign the task to"),
    category: z.enum([
      "onboarding",
      "offboarding",
      "performance",
      "compliance",
      "benefits",
      "other"
    ]).optional().describe("Category of the HR task"),
  }),
  execute: async ({ title, description, priority, dueDate, assignee, category }) => {
    // In a real implementation, this would create a task in your task management system
    const taskId = `task_${Date.now()}`;
    
    return {
      success: true,
      taskId,
      task: {
        id: taskId,
        title,
        description,
        priority,
        dueDate: dueDate || null,
        assignee: assignee || null,
        category: category || "other",
        status: "pending",
        createdAt: new Date().toISOString(),
      },
      message: `Task "${title}" created successfully`,
    };
  },
});

/**
 * Get Employee Info Tool
 * Retrieves employee information (with appropriate access controls)
 */
export const getEmployeeInfoTool = tool({
  description: "Retrieve employee information. Use this when you need to look up details about an employee.",
  inputSchema: z.object({
    employeeId: z.string().optional().describe("The employee ID to look up"),
    email: z.string().optional().describe("The employee email to look up"),
    name: z.string().optional().describe("The employee name to search for"),
  }),
  execute: async ({ employeeId, email, name }) => {
    const query = name || email || employeeId || "";
    if (!query.trim()) {
      return {
        found: false,
        message: "Please provide an employee name, email, or ID to search",
        results: [],
      };
    }
    const results = await searchEmployees(query);
    if (results.length === 0) {
      return {
        found: false,
        message: `No employees found matching "${query}"`,
        results: [],
      };
    }
    return {
      found: true,
      message: `Found ${results.length} employee(s)`,
      results: results.map((e) => ({
        id: e.id,
        employeeId: e.employeeId,
        fullName: e.fullName,
        email: e.email,
        department: e.department,
        jobTitle: e.jobTitle,
        managerName: e.managerName,
        notes: e.notes.map((n) => ({
          type: n.noteType,
          title: n.title,
          severity: n.severity,
          occurredAt: n.occurredAt,
        })),
      })),
    };
  },
});

/**
 * Calculate PTO Tool
 * Calculate PTO balance and accruals
 */
export const calculatePTOTool = tool({
  description: "Calculate paid time off (PTO) balance and accruals for an employee",
  inputSchema: z.object({
    employeeId: z.string().describe("The employee ID"),
    asOfDate: z.string().optional().describe("Calculate balance as of this date (YYYY-MM-DD)"),
    includeProjections: z.boolean().optional().default(false).describe("Include future accrual projections"),
  }),
  execute: async ({ employeeId, asOfDate, includeProjections }) => {
    // In a real implementation, this would calculate actual PTO
    return {
      employeeId,
      asOfDate: asOfDate || new Date().toISOString().split("T")[0],
      message: "PTO calculation requires HRIS integration",
      includeProjections,
    };
  },
});

/**
 * Generate Document Tool
 * Generate HR documents from templates
 */
export const generateDocumentTool = tool({
  description: "Generate an HR document from a template, such as offer letters, policies, or forms",
  inputSchema: z.object({
    documentType: z.enum([
      "offer_letter",
      "termination_letter",
      "policy",
      "performance_review",
      "warning_notice",
      "other"
    ]).describe("Type of document to generate"),
    recipientName: z.string().optional().describe("Name of the recipient"),
    details: z.record(z.string(), z.string()).optional().describe("Additional details to include in the document"),
  }),
  execute: async ({ documentType, recipientName, details }) => {
    return {
      documentType,
      recipientName: recipientName || null,
      details: details || {},
      message: `Document template "${documentType}" selected. Full generation requires template configuration.`,
      templateAvailable: false,
    };
  },
});

/**
 * All available tools
 */
export const allTools = {
  searchKnowledgeBase: searchKnowledgeBaseTool,
  createTask: createTaskTool,
  getEmployeeInfo: getEmployeeInfoTool,
  calculatePTO: calculatePTOTool,
  generateDocument: generateDocumentTool,
};

/**
 * Get a subset of tools by name
 */
export function getTools(toolNames: (keyof typeof allTools)[]) {
  return Object.fromEntries(
    toolNames.map((name) => [name, allTools[name]])
  );
}

/**
 * Default tools enabled for chat
 */
export const defaultChatTools = {
  searchKnowledgeBase: searchKnowledgeBaseTool,
  createTask: createTaskTool,
  getEmployeeInfo: getEmployeeInfoTool,
  startCorrectiveAction: startCorrectiveActionTool,
  updateWorkflowField: updateWorkflowFieldTool,
  generateCorrectiveActionDocument: generateCorrectiveActionDocumentTool,
  generateWorkflowFollowUp: generateWorkflowFollowUpTool,
  startGoalWorkflow: startGoalWorkflowTool,
  openGoalDocument: openGoalDocumentTool,
  startCheckIn: startCheckInTool,
  startPerformanceNote: startPerformanceNoteTool,
  completeGrowWorkflow: completeGrowWorkflowTool,
  startMyRoleWorkflow: startMyRoleWorkflowTool,
  openMyRoleDocument: openMyRoleDocumentTool,
  suggestFromJD: suggestFromJDTool,
  startJobDescriptionWorkflow: startJobDescriptionWorkflowTool,
  openJobDescriptionDocument: openJobDescriptionDocumentTool,
};

/**
 * Full HR toolkit
 */
export const fullHRToolkit = allTools;
