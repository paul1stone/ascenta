import mongoose, { Schema, Types } from "mongoose";

// ============================================================================
// SHARED
// ============================================================================

const toJSONOptions = {
  virtuals: true,
  transform(_doc: unknown, ret: Record<string, unknown>) {
    ret.id = String(ret._id);
    delete ret._id;
    delete ret.__v;
    return ret;
  },
};

// ============================================================================
// EMBEDDED SUB-DOCUMENT SCHEMAS
// ============================================================================

const intakeFieldSchema = new Schema(
  {
    fieldKey: { type: String, required: true },
    label: { type: String, required: true },
    type: { type: String, required: true },
    placeholder: { type: String },
    helpText: { type: String },
    required: { type: Boolean, default: false },
    validationRules: { type: Schema.Types.Mixed },
    options: { type: Schema.Types.Mixed },
    sortOrder: { type: Number, default: 0 },
    groupName: { type: String },
    conditionalOn: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const guardrailSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    triggerCondition: { type: Schema.Types.Mixed, required: true },
    severity: { type: String, required: true },
    message: { type: String, required: true },
    requiredAction: { type: String },
    escalateTo: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const artifactTemplateSchema = new Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    sections: { type: Schema.Types.Mixed, required: true },
    exportFormats: { type: Schema.Types.Mixed },
    metadata: { type: Schema.Types.Mixed },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const textLibrarySchema = new Schema(
  {
    category: { type: String, required: true },
    key: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    metadata: { type: Schema.Types.Mixed },
    isActive: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const guidedActionSchema = new Schema(
  {
    label: { type: String, required: true },
    description: { type: String },
    icon: { type: String },
    requiredInputs: { type: Schema.Types.Mixed },
    outputType: { type: String, required: true },
    outputTarget: { type: String },
    promptTemplate: { type: String, required: true },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// ============================================================================
// WORKFLOW DEFINITION (with embedded sub-docs)
// ============================================================================

const workflowDefinitionSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, required: true, index: true },
    audience: { type: String, required: true },
    riskLevel: { type: String, required: true },
    version: { type: Number, default: 1 },
    isActive: { type: Boolean, default: true },
    estimatedMinutes: { type: Number },
    metadata: { type: Schema.Types.Mixed },
    intakeFields: [intakeFieldSchema],
    guardrails: [guardrailSchema],
    artifactTemplates: [artifactTemplateSchema],
    textLibraries: [textLibrarySchema],
    guidedActions: [guidedActionSchema],
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const WorkflowDefinition =
  mongoose.models.WorkflowDefinition ||
  mongoose.model("WorkflowDefinition", workflowDefinitionSchema);

// ============================================================================
// WORKFLOW RUN
// ============================================================================

const workflowRunSchema = new Schema(
  {
    workflowDefinitionId: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowDefinition",
      required: true,
      index: true,
    },
    workflowVersion: { type: Number, required: true },
    userId: { type: String, required: true, index: true },
    inputsSnapshot: { type: Schema.Types.Mixed, required: true },
    status: { type: String, required: true, index: true },
    currentStep: { type: String, default: "intake" },
    guardrailsTriggered: { type: Schema.Types.Mixed },
    reviewerId: { type: String },
    reviewedAt: { type: Date },
    reviewNotes: { type: String },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const WorkflowRun =
  mongoose.models.WorkflowRun ||
  mongoose.model("WorkflowRun", workflowRunSchema);

// ============================================================================
// WORKFLOW OUTPUT
// ============================================================================

const workflowOutputSchema = new Schema(
  {
    workflowRunId: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowRun",
      required: true,
      index: true,
    },
    artifactTemplateId: { type: Schema.Types.ObjectId },
    version: { type: Number, default: 1 },
    content: { type: Schema.Types.Mixed, required: true },
    renderedContent: { type: String },
    exportedAt: { type: Date },
    exportFormat: { type: String },
    exportUrl: { type: String },
    contentHash: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  {
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const WorkflowOutput =
  mongoose.models.WorkflowOutput ||
  mongoose.model("WorkflowOutput", workflowOutputSchema);

// ============================================================================
// AUDIT EVENT
// ============================================================================

const auditEventSchema = new Schema(
  {
    workflowRunId: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowRun",
      required: true,
      index: true,
    },
    actorId: { type: String, required: true, index: true },
    actorType: { type: String, required: true },
    action: { type: String, required: true, index: true },
    description: { type: String },
    inputHash: { type: String },
    outputHash: { type: String },
    metadata: { type: Schema.Types.Mixed },
    rationale: { type: String },
    workflowVersion: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const AuditEvent =
  mongoose.models.AuditEvent ||
  mongoose.model("AuditEvent", auditEventSchema);

// ============================================================================
// TRACKED DOCUMENT
// ============================================================================

export const TRACKED_DOCUMENT_STAGES = [
  "draft",
  "on_us_to_send",
  "sent",
  "in_review",
  "acknowledged",
  "completed",
] as const;
export type TrackedDocumentStage = (typeof TRACKED_DOCUMENT_STAGES)[number];

const trackedDocumentSchema = new Schema(
  {
    workflowRunId: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowRun",
      required: true,
      index: true,
    },
    workflowOutputId: {
      type: Schema.Types.ObjectId,
      ref: "WorkflowOutput",
    },
    title: { type: String, required: true },
    documentType: { type: String, default: "corrective_action" },
    employeeName: { type: String },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      index: true,
    },
    stage: { type: String, default: "draft", index: true },
    completedActions: { type: Schema.Types.Mixed, default: {} },
    employeeEmail: { type: String },
    sentAt: { type: Date },
    acknowledgedAt: { type: Date },
    ackToken: { type: String },
    reminderSentAt: { type: Date },
    reminderCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: toJSONOptions,
    toObject: toJSONOptions,
  }
);

export const TrackedDocument =
  mongoose.models.TrackedDocument ||
  mongoose.model("TrackedDocument", trackedDocumentSchema);

// ============================================================================
// TYPE ALIASES (backward compatibility)
// ============================================================================

export type WorkflowDefinition_Type = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string;
  audience: string;
  riskLevel: string;
  version: number;
  isActive: boolean;
  estimatedMinutes: number | null;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type NewWorkflowDefinition = {
  slug: string;
  name: string;
  description?: string | null;
  category: string;
  audience: string;
  riskLevel: string;
  version?: number;
  isActive?: boolean;
  estimatedMinutes?: number | null;
  metadata?: unknown;
};

export type IntakeField = {
  id: string;
  workflowDefinitionId: string;
  fieldKey: string;
  label: string;
  type: string;
  placeholder: string | null;
  helpText: string | null;
  required: boolean;
  validationRules: unknown;
  options: unknown;
  sortOrder: number;
  groupName: string | null;
  conditionalOn: unknown;
  createdAt: Date;
};

export type NewIntakeField = {
  workflowDefinitionId: string;
  fieldKey: string;
  label: string;
  type: string;
  placeholder?: string | null;
  helpText?: string | null;
  required?: boolean;
  validationRules?: unknown;
  options?: unknown;
  sortOrder?: number;
  groupName?: string | null;
  conditionalOn?: unknown;
};

export type Guardrail = {
  id: string;
  workflowDefinitionId: string;
  name: string;
  description: string | null;
  triggerCondition: unknown;
  severity: string;
  message: string;
  requiredAction: string | null;
  escalateTo: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
};

export type NewGuardrail = {
  workflowDefinitionId: string;
  name: string;
  description?: string | null;
  triggerCondition: unknown;
  severity: string;
  message: string;
  requiredAction?: string | null;
  escalateTo?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export type ArtifactTemplate = {
  id: string;
  workflowDefinitionId: string;
  name: string;
  type: string;
  sections: unknown;
  exportFormats: unknown;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export type NewArtifactTemplate = {
  workflowDefinitionId: string;
  name: string;
  type: string;
  sections: unknown;
  exportFormats?: unknown;
  metadata?: unknown;
};

export type TextLibrary = {
  id: string;
  category: string;
  key: string;
  title: string;
  content: string;
  workflowDefinitionId: string | null;
  metadata: unknown;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTextLibrary = {
  category: string;
  key: string;
  title: string;
  content: string;
  workflowDefinitionId?: string | null;
  metadata?: unknown;
  isActive?: boolean;
  sortOrder?: number;
};

export type WorkflowRun_Type = {
  id: string;
  workflowDefinitionId: string;
  workflowVersion: number;
  userId: string;
  inputsSnapshot: unknown;
  status: string;
  currentStep: string;
  guardrailsTriggered: unknown;
  reviewerId: string | null;
  reviewedAt: Date | null;
  reviewNotes: string | null;
  createdAt: Date;
  updatedAt: Date;
  completedAt: Date | null;
};

export type NewWorkflowRun = {
  workflowDefinitionId: string;
  workflowVersion: number;
  userId: string;
  inputsSnapshot: unknown;
  status: string;
  currentStep?: string;
  guardrailsTriggered?: unknown;
};

export type WorkflowOutput_Type = {
  id: string;
  workflowRunId: string;
  artifactTemplateId: string | null;
  version: number;
  content: unknown;
  renderedContent: string | null;
  exportedAt: Date | null;
  exportFormat: string | null;
  exportUrl: string | null;
  contentHash: string | null;
  createdAt: Date;
};

export type NewWorkflowOutput = {
  workflowRunId: string;
  artifactTemplateId?: string | null;
  version?: number;
  content: unknown;
  renderedContent?: string | null;
  contentHash?: string | null;
};

export type AuditEvent_Type = {
  id: string;
  workflowRunId: string;
  actorId: string;
  actorType: string;
  action: string;
  description: string | null;
  inputHash: string | null;
  outputHash: string | null;
  metadata: unknown;
  rationale: string | null;
  workflowVersion: number;
  timestamp: Date;
};

export type NewAuditEvent = {
  workflowRunId: string;
  actorId: string;
  actorType: string;
  action: string;
  description?: string | null;
  inputHash?: string | null;
  outputHash?: string | null;
  metadata?: unknown;
  rationale?: string | null;
  workflowVersion: number;
};

export type GuidedAction = {
  id: string;
  workflowDefinitionId: string;
  label: string;
  description: string | null;
  icon: string | null;
  requiredInputs: unknown;
  outputType: string;
  outputTarget: string | null;
  promptTemplate: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
};

export type NewGuidedAction = {
  workflowDefinitionId: string;
  label: string;
  description?: string | null;
  icon?: string | null;
  requiredInputs?: unknown;
  outputType: string;
  outputTarget?: string | null;
  promptTemplate: string;
  sortOrder?: number;
  isActive?: boolean;
};

export type TrackedDocument_Type = {
  id: string;
  workflowRunId: string;
  workflowOutputId: string | null;
  title: string;
  documentType: string;
  employeeName: string | null;
  employeeId: string | null;
  stage: string;
  completedActions: unknown;
  employeeEmail: string | null;
  sentAt: Date | null;
  acknowledgedAt: Date | null;
  ackToken: string | null;
  reminderSentAt: Date | null;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
};

export type NewTrackedDocument = {
  workflowRunId: string;
  workflowOutputId?: string | null;
  title: string;
  documentType?: string;
  employeeName?: string | null;
  employeeId?: string | null;
  stage?: string;
  completedActions?: unknown;
  employeeEmail?: string | null;
};
