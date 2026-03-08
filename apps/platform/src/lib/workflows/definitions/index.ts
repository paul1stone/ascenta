/**
 * Workflow Definitions Index
 * Registers all code-defined workflows
 */

import { registerWorkflow } from "../engine";
import { writtenWarningWorkflow } from "./written-warning";
import { pipWorkflow } from "./pip";
import { investigationSummaryWorkflow } from "./investigation-summary";
import { addPerformanceNoteWorkflow } from "./add-performance-note";
import { runCheckInWorkflow } from "./run-check-in";
import { createGoalWorkflow } from "./create-goal";

/**
 * Register all workflows
 * Call this during application initialization
 */
export function registerAllWorkflows(): void {
  registerWorkflow(writtenWarningWorkflow);
  registerWorkflow(pipWorkflow);
  registerWorkflow(investigationSummaryWorkflow);
  registerWorkflow(addPerformanceNoteWorkflow);
  registerWorkflow(runCheckInWorkflow);
  registerWorkflow(createGoalWorkflow);
}

// Export individual workflows for direct access
export { writtenWarningWorkflow } from "./written-warning";
export { pipWorkflow } from "./pip";
export { investigationSummaryWorkflow } from "./investigation-summary";
export { addPerformanceNoteWorkflow } from "./add-performance-note";
export { runCheckInWorkflow } from "./run-check-in";
export { createGoalWorkflow } from "./create-goal";
