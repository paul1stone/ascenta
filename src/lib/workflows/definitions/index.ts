/**
 * Workflow Definitions Index
 * Registers all code-defined workflows
 */

import { registerWorkflow } from "../engine";
import { writtenWarningWorkflow } from "./written-warning";
import { pipWorkflow } from "./pip";
import { investigationSummaryWorkflow } from "./investigation-summary";

/**
 * Register all workflows
 * Call this during application initialization
 */
export function registerAllWorkflows(): void {
  registerWorkflow(writtenWarningWorkflow);
  registerWorkflow(pipWorkflow);
  registerWorkflow(investigationSummaryWorkflow);
}

// Export individual workflows for direct access
export { writtenWarningWorkflow } from "./written-warning";
export { pipWorkflow } from "./pip";
export { investigationSummaryWorkflow } from "./investigation-summary";
