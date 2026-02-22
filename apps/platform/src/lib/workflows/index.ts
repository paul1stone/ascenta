/**
 * Workflows Module
 * Public exports for the workflow system
 */

// Types
export * from "./types";

// Engine
export {
  registerWorkflow,
  getRegisteredWorkflow,
  getAllRegisteredWorkflows,
  syncWorkflowToDatabase,
  syncAllWorkflowsToDatabase,
  listWorkflows,
  getWorkflowBySlug,
  startWorkflowRun,
  getWorkflowRun,
  updateWorkflowRun,
  generateWorkflowArtifact,
  exportWorkflowArtifact,
  cancelWorkflowRun,
  getUserWorkflowRuns,
} from "./engine";

// Guardrails
export {
  evaluateGuardrail,
  evaluateGuardrails,
  canProceed,
  getGuardrailSummary,
  formatGuardrailsForAudit,
  // Condition builders
  equals,
  isIn,
  isEmpty,
  isNotEmpty,
  isTrue,
  and,
  or,
} from "./guardrails";

// Artifacts
export {
  interpolateTemplate,
  formatDate,
  generateSectionContent,
  generateSectionContentSync,
  generateArtifact,
  renderArtifact,
  renderArtifactAsHtml,
  createArtifactVersion,
  compareArtifacts,
} from "./artifacts";

// Audit
export {
  generateInputHash,
  generateOutputHash,
  verifyHash,
  logAuditEvent,
  logWorkflowCreated,
  logWorkflowUpdated,
  logGuardrailTriggered,
  logGuardrailOverridden,
  logArtifactGenerated,
  logReviewed,
  logExported,
  logCancelled,
  getAuditTrail,
  getAuditEventsByAction,
  verifyAuditTrailIntegrity,
  formatAuditTrailReport,
  exportAuditTrailAsJson,
} from "./audit";

// Workflow Definitions
export { registerAllWorkflows } from "./definitions";
