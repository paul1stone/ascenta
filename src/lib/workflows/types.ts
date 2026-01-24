/**
 * Workflow System Type Definitions
 * Core interfaces and types for the workflow execution framework
 */

// ============================================================================
// ENUMS & CONSTANTS
// ============================================================================

export const WORKFLOW_CATEGORIES = [
  "corrective",
  "performance",
  "investigation",
  "scheduling",
  "compliance",
  "communication",
] as const;
export type WorkflowCategory = (typeof WORKFLOW_CATEGORIES)[number];

export const WORKFLOW_AUDIENCES = ["manager", "hr", "hr_only"] as const;
export type WorkflowAudience = (typeof WORKFLOW_AUDIENCES)[number];

export const RISK_LEVELS = ["low", "medium", "high"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const WORKFLOW_STATUSES = [
  "intake",
  "review",
  "generating",
  "export",
  "completed",
  "cancelled",
] as const;
export type WorkflowStatus = (typeof WORKFLOW_STATUSES)[number];

export const GUARDRAIL_SEVERITIES = [
  "hard_stop",
  "warning",
  "escalation",
] as const;
export type GuardrailSeverity = (typeof GUARDRAIL_SEVERITIES)[number];

export const GUARDRAIL_ACTIONS = [
  "rationale",
  "hr_review",
  "role_lock",
] as const;
export type GuardrailAction = (typeof GUARDRAIL_ACTIONS)[number];

export const INTAKE_FIELD_TYPES = [
  "text",
  "textarea",
  "dropdown",
  "checkbox",
  "checkbox_group",
  "date",
  "number",
] as const;
export type IntakeFieldType = (typeof INTAKE_FIELD_TYPES)[number];

export const ARTIFACT_TYPES = [
  "letter",
  "summary",
  "script",
  "checklist",
  "memo",
] as const;
export type ArtifactType = (typeof ARTIFACT_TYPES)[number];

export const TEXT_LIBRARY_CATEGORIES = [
  "expectations",
  "consequences",
  "policy_references",
  "acknowledgment",
] as const;
export type TextLibraryCategory = (typeof TEXT_LIBRARY_CATEGORIES)[number];

export const AUDIT_ACTIONS = [
  "created",
  "updated",
  "guardrail_triggered",
  "guardrail_overridden",
  "generated",
  "reviewed",
  "approved",
  "exported",
  "cancelled",
] as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export const GUIDED_ACTION_OUTPUTS = [
  "artifact",
  "analysis",
  "checklist",
  "rewrite",
] as const;
export type GuidedActionOutput = (typeof GUIDED_ACTION_OUTPUTS)[number];

// ============================================================================
// INTAKE FIELD DEFINITIONS
// ============================================================================

export interface IntakeFieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  min?: number;
  max?: number;
  customValidator?: string; // Function name for custom validation
}

export interface ConditionalRule {
  fieldKey: string;
  operator: "equals" | "not_equals" | "contains" | "not_empty" | "empty";
  value?: unknown;
}

export interface IntakeFieldDefinition {
  fieldKey: string;
  label: string;
  type: IntakeFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  validationRules?: ValidationRules;
  options?: IntakeFieldOption[];
  defaultValue?: unknown;
  sortOrder: number;
  groupName?: string;
  conditionalOn?: ConditionalRule;
}

// ============================================================================
// GUARDRAIL DEFINITIONS
// ============================================================================

export type GuardrailOperator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "in"
  | "not_in"
  | "greater_than"
  | "less_than"
  | "greater_or_equal"
  | "less_or_equal"
  | "is_empty"
  | "is_not_empty"
  | "is_true"
  | "is_false";

export interface GuardrailCondition {
  field: string;
  operator: GuardrailOperator;
  value?: unknown;
  // Nested conditions for complex logic
  and?: GuardrailCondition[];
  or?: GuardrailCondition[];
}

export interface GuardrailDefinition {
  id: string;
  name: string;
  description?: string;
  triggerCondition: GuardrailCondition;
  severity: GuardrailSeverity;
  message: string;
  requiredAction?: GuardrailAction;
  escalateTo?: string;
  sortOrder: number;
  isActive: boolean;
}

export interface GuardrailResult {
  guardrailId: string;
  name: string;
  passed: boolean;
  severity: GuardrailSeverity;
  message: string;
  requiredAction?: GuardrailAction;
  rationaleProvided?: string;
  escalateTo?: string;
  triggeredAt?: Date;
}

export interface GuardrailEvaluationResult {
  allPassed: boolean;
  hasHardStop: boolean;
  hasWarnings: boolean;
  hasEscalations: boolean;
  results: GuardrailResult[];
  rationalesRequired: string[]; // Guardrail IDs that need rationale
}

// ============================================================================
// ARTIFACT TEMPLATES
// ============================================================================

export interface ArtifactSection {
  key: string;
  title: string;
  locked: boolean; // If true, content cannot be edited
  content?: string; // Static content for locked sections
  aiPrompt?: string; // Prompt for AI-generated content
  inputMapping?: Record<string, string>; // Maps intake field keys to template placeholders
  textLibraryKeys?: string[]; // Keys to pull from text library
}

export interface ArtifactTemplateDefinition {
  id: string;
  name: string;
  type: ArtifactType;
  sections: ArtifactSection[];
  exportFormats: ("pdf" | "docx")[];
  metadata?: Record<string, unknown>;
}

export interface GeneratedArtifact {
  templateId: string;
  version: number;
  sections: Record<string, string>; // key -> rendered content
  renderedContent: string; // Full rendered document
  contentHash: string;
  generatedAt: Date;
}

// ============================================================================
// GUIDED ACTIONS (Ask Ascenta)
// ============================================================================

export interface GuidedActionDefinition {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  requiredInputs: string[]; // Field keys that must be filled
  outputType: GuidedActionOutput;
  outputTarget?: string; // Section or field this populates
  promptTemplate: string; // Uses {{fieldKey}} placeholders
  sortOrder: number;
  isActive: boolean;
}

export interface GuidedActionResult {
  actionId: string;
  success: boolean;
  output?: string;
  error?: string;
  executedAt: Date;
}

// ============================================================================
// WORKFLOW DEFINITION (COMBINED)
// ============================================================================

export interface WorkflowDefinitionConfig {
  slug: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  audience: WorkflowAudience;
  riskLevel: RiskLevel;
  estimatedMinutes?: number;
  icon?: string;
  // Nested definitions
  intakeFields: IntakeFieldDefinition[];
  guardrails: GuardrailDefinition[];
  artifactTemplates: ArtifactTemplateDefinition[];
  guidedActions: GuidedActionDefinition[];
  // Text library entries specific to this workflow
  textLibraryEntries?: TextLibraryEntry[];
  // Metadata
  metadata?: Record<string, unknown>;
}

export interface TextLibraryEntry {
  category: TextLibraryCategory;
  key: string;
  title: string;
  content: string;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// WORKFLOW EXECUTION
// ============================================================================

export interface WorkflowInputs {
  [fieldKey: string]: unknown;
}

export interface WorkflowRunState {
  id: string;
  workflowSlug: string;
  workflowVersion: number;
  userId: string;
  status: WorkflowStatus;
  currentStep: WorkflowStatus;
  inputs: WorkflowInputs;
  guardrailResults?: GuardrailEvaluationResult;
  rationales: Record<string, string>; // guardrailId -> rationale
  generatedArtifact?: GeneratedArtifact;
  reviewerId?: string;
  reviewedAt?: Date;
  reviewNotes?: string;
  exportedAt?: Date;
  exportFormat?: "pdf" | "docx";
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ============================================================================
// AUDIT TRAIL
// ============================================================================

export interface AuditEventData {
  workflowRunId: string;
  actorId: string;
  actorType: "user" | "system";
  action: AuditAction;
  description?: string;
  inputHash?: string;
  outputHash?: string;
  metadata?: Record<string, unknown>;
  rationale?: string;
  workflowVersion: number;
}

export interface AuditEventRecord extends AuditEventData {
  id: string;
  timestamp: Date;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface WorkflowListItem {
  id: string;
  slug: string;
  name: string;
  description?: string;
  category: WorkflowCategory;
  audience: WorkflowAudience;
  riskLevel: RiskLevel;
  estimatedMinutes?: number;
  icon?: string;
}

export interface WorkflowDetail extends WorkflowListItem {
  intakeFields: IntakeFieldDefinition[];
  guardrails: GuardrailDefinition[];
  artifactTemplates: ArtifactTemplateDefinition[];
  guidedActions: GuidedActionDefinition[];
}

export interface StartWorkflowRequest {
  workflowSlug: string;
  userId: string;
}

export interface StartWorkflowResponse {
  runId: string;
  workflowSlug: string;
  status: WorkflowStatus;
}

export interface UpdateWorkflowRunRequest {
  inputs?: Partial<WorkflowInputs>;
  rationales?: Record<string, string>;
  action?: "save" | "validate" | "next_step";
}

export interface UpdateWorkflowRunResponse {
  runId: string;
  status: WorkflowStatus;
  currentStep: WorkflowStatus;
  guardrailResults?: GuardrailEvaluationResult;
  canProceed: boolean;
  errors?: string[];
}

export interface GenerateArtifactRequest {
  templateId?: string; // Use default if not specified
  customPrompts?: Record<string, string>; // Section key -> custom prompt
}

export interface GenerateArtifactResponse {
  artifact: GeneratedArtifact;
  runId: string;
}

export interface ExportArtifactRequest {
  format: "pdf" | "docx";
  reviewConfirmations: {
    accuracyReviewed: boolean;
    noPHI: boolean;
    policyReferencesCorrect: boolean;
  };
}

export interface ExportArtifactResponse {
  exportUrl: string;
  format: "pdf" | "docx";
  exportedAt: Date;
}
