import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { employees } from "./employee-schema";

// ============================================================================
// WORKFLOW DEFINITIONS
// ============================================================================

/**
 * Workflow Definitions - Core workflow metadata
 * Defines the structure and configuration of each workflow type
 */
export const workflowDefinitions = pgTable(
  "workflow_definitions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    // Unique identifier for code-defined workflows (e.g., "written-warning")
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category").notNull(), // 'corrective' | 'performance' | 'investigation' | 'scheduling' | 'compliance'
    audience: text("audience").notNull(), // 'manager' | 'hr' | 'hr_only'
    riskLevel: text("risk_level").notNull(), // 'low' | 'medium' | 'high'
    version: integer("version").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    estimatedMinutes: integer("estimated_minutes"),
    // JSON for flexible metadata (icons, colors, etc.)
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("workflow_definitions_slug_idx").on(table.slug),
    index("workflow_definitions_category_idx").on(table.category),
  ]
);

// ============================================================================
// INTAKE FIELDS
// ============================================================================

/**
 * Intake Fields - Dynamic form field definitions per workflow
 * Defines the input fields for each workflow's intake form
 */
export const intakeFields = pgTable(
  "intake_fields",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowDefinitionId: uuid("workflow_definition_id")
      .references(() => workflowDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    // Field configuration
    fieldKey: text("field_key").notNull(), // programmatic key
    label: text("label").notNull(),
    type: text("type").notNull(), // 'text' | 'textarea' | 'dropdown' | 'checkbox' | 'checkbox_group' | 'date' | 'number'
    placeholder: text("placeholder"),
    helpText: text("help_text"),
    // Validation
    required: boolean("required").default(false).notNull(),
    validationRules: jsonb("validation_rules"), // { minLength, maxLength, pattern, min, max, etc. }
    // For dropdown/checkbox_group types
    options: jsonb("options"), // [{ value: string, label: string }]
    // Ordering and grouping
    sortOrder: integer("sort_order").default(0).notNull(),
    groupName: text("group_name"), // For grouping related fields
    // Conditional display
    conditionalOn: jsonb("conditional_on"), // { fieldKey: string, value: any }
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("intake_fields_workflow_id_idx").on(table.workflowDefinitionId),
  ]
);

// ============================================================================
// GUARDRAILS
// ============================================================================

/**
 * Guardrails - Rule definitions with triggers and severity
 * Defines the business rules that must be evaluated during workflow execution
 */
export const guardrails = pgTable(
  "guardrails",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowDefinitionId: uuid("workflow_definition_id")
      .references(() => workflowDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    description: text("description"),
    // Rule definition (evaluated as code, not AI)
    // Format: { field: string, operator: string, value: any, and?: Rule[], or?: Rule[] }
    triggerCondition: jsonb("trigger_condition").notNull(),
    // Outcome
    severity: text("severity").notNull(), // 'hard_stop' | 'warning' | 'escalation'
    message: text("message").notNull(), // Message shown to user
    requiredAction: text("required_action"), // 'rationale' | 'hr_review' | 'role_lock' | null
    // For escalations
    escalateTo: text("escalate_to"), // Role or user to escalate to
    // Ordering
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("guardrails_workflow_id_idx").on(table.workflowDefinitionId),
  ]
);

// ============================================================================
// ARTIFACT TEMPLATES
// ============================================================================

/**
 * Artifact Templates - Locked section templates per workflow
 * Defines the structure of generated documents with locked/editable sections
 */
export const artifactTemplates = pgTable(
  "artifact_templates",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowDefinitionId: uuid("workflow_definition_id")
      .references(() => workflowDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(), // 'letter' | 'summary' | 'script' | 'checklist' | 'memo'
    // Template sections - array of { key, title, locked, content?, aiPrompt? }
    sections: jsonb("sections").notNull(),
    // Export configuration
    exportFormats: jsonb("export_formats"), // ['pdf', 'docx']
    // Metadata
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("artifact_templates_workflow_id_idx").on(table.workflowDefinitionId),
  ]
);

// ============================================================================
// TEXT LIBRARIES
// ============================================================================

/**
 * Text Libraries - Standard language blocks
 * Pre-approved text snippets for expectations, consequences, policies, etc.
 */
export const textLibraries = pgTable(
  "text_libraries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    category: text("category").notNull(), // 'expectations' | 'consequences' | 'policy_references' | 'acknowledgment'
    key: text("key").notNull(), // Programmatic identifier
    title: text("title").notNull(),
    content: text("content").notNull(),
    // Optional association with specific workflows
    workflowDefinitionId: uuid("workflow_definition_id").references(
      () => workflowDefinitions.id,
      { onDelete: "set null" }
    ),
    // Metadata
    metadata: jsonb("metadata"), // { severity_level, applicable_to, etc. }
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("text_libraries_category_idx").on(table.category),
    index("text_libraries_workflow_id_idx").on(table.workflowDefinitionId),
  ]
);

// ============================================================================
// WORKFLOW RUNS
// ============================================================================

/**
 * Workflow Runs - Execution instances with input snapshots
 * Tracks each execution of a workflow
 */
export const workflowRuns = pgTable(
  "workflow_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowDefinitionId: uuid("workflow_definition_id")
      .references(() => workflowDefinitions.id)
      .notNull(),
    workflowVersion: integer("workflow_version").notNull(),
    // User info
    userId: text("user_id").notNull(),
    // Immutable snapshot of inputs at each step
    inputsSnapshot: jsonb("inputs_snapshot").notNull(),
    // Current state
    status: text("status").notNull(), // 'intake' | 'review' | 'generating' | 'export' | 'completed' | 'cancelled'
    currentStep: text("current_step").default("intake").notNull(),
    // Guardrail results
    guardrailsTriggered: jsonb("guardrails_triggered"), // [{ guardrailId, severity, message, rationaleProvided? }]
    // Review info
    reviewerId: text("reviewer_id"),
    reviewedAt: timestamp("reviewed_at"),
    reviewNotes: text("review_notes"),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("workflow_runs_workflow_id_idx").on(table.workflowDefinitionId),
    index("workflow_runs_user_id_idx").on(table.userId),
    index("workflow_runs_status_idx").on(table.status),
  ]
);

// ============================================================================
// WORKFLOW OUTPUTS
// ============================================================================

/**
 * Workflow Outputs - Generated artifacts per run (versioned)
 * Stores the generated documents with version history
 */
export const workflowOutputs = pgTable(
  "workflow_outputs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowRunId: uuid("workflow_run_id")
      .references(() => workflowRuns.id, { onDelete: "cascade" })
      .notNull(),
    artifactTemplateId: uuid("artifact_template_id").references(
      () => artifactTemplates.id
    ),
    // Version tracking
    version: integer("version").default(1).notNull(),
    // Content
    content: jsonb("content").notNull(), // Structured content by section
    renderedContent: text("rendered_content"), // Final rendered output (HTML/text)
    // Export info
    exportedAt: timestamp("exported_at"),
    exportFormat: text("export_format"), // 'pdf' | 'docx'
    exportUrl: text("export_url"), // URL to exported file if stored
    // Hashes for audit integrity
    contentHash: text("content_hash"), // SHA-256 of content
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("workflow_outputs_run_id_idx").on(table.workflowRunId),
  ]
);

// ============================================================================
// AUDIT EVENTS
// ============================================================================

/**
 * Audit Events - Immutable audit trail
 * Records all actions taken during workflow execution
 */
export const auditEvents = pgTable(
  "audit_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowRunId: uuid("workflow_run_id")
      .references(() => workflowRuns.id, { onDelete: "cascade" })
      .notNull(),
    // Actor information
    actorId: text("actor_id").notNull(),
    actorType: text("actor_type").notNull(), // 'user' | 'system'
    // Event details
    action: text("action").notNull(), // 'created' | 'updated' | 'guardrail_triggered' | 'generated' | 'reviewed' | 'exported' | 'cancelled'
    description: text("description"),
    // Integrity hashes
    inputHash: text("input_hash"), // SHA-256 of inputs at this point
    outputHash: text("output_hash"), // SHA-256 of outputs if applicable
    // Additional context
    metadata: jsonb("metadata"), // Step name, guardrail ID, etc.
    rationale: text("rationale"), // User-provided rationale for overrides
    // Version tracking
    workflowVersion: integer("workflow_version").notNull(),
    // Timestamp (immutable)
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => [
    index("audit_events_run_id_idx").on(table.workflowRunId),
    index("audit_events_actor_id_idx").on(table.actorId),
    index("audit_events_action_idx").on(table.action),
    index("audit_events_timestamp_idx").on(table.timestamp),
  ]
);

// ============================================================================
// GUIDED ACTIONS (Ask Ascenta)
// ============================================================================

/**
 * Guided Actions - Curated AI actions per workflow
 * Replaces free-form prompting with structured actions
 */
export const guidedActions = pgTable(
  "guided_actions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowDefinitionId: uuid("workflow_definition_id")
      .references(() => workflowDefinitions.id, { onDelete: "cascade" })
      .notNull(),
    // Action definition
    label: text("label").notNull(), // "Turn these facts into a written warning"
    description: text("description"),
    icon: text("icon"), // Lucide icon name
    // Required inputs before this action can run
    requiredInputs: jsonb("required_inputs"), // [fieldKey, fieldKey, ...]
    // Output configuration
    outputType: text("output_type").notNull(), // 'artifact' | 'analysis' | 'checklist' | 'rewrite'
    outputTarget: text("output_target"), // Which section/field this populates
    // AI prompt template (uses {{fieldKey}} placeholders)
    promptTemplate: text("prompt_template").notNull(),
    // Ordering
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("guided_actions_workflow_id_idx").on(table.workflowDefinitionId),
  ]
);

// ============================================================================
// TRACKED DOCUMENTS (Progress tracker / Kanban)
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

/**
 * Tracked Documents - Generated workflow documents in a delivery pipeline
 * Used for agile-style board: On us to send, Sent, In review, etc.
 */
export const trackedDocuments = pgTable(
  "tracked_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    workflowRunId: uuid("workflow_run_id")
      .references(() => workflowRuns.id, { onDelete: "cascade" })
      .notNull(),
    workflowOutputId: uuid("workflow_output_id").references(
      () => workflowOutputs.id,
      { onDelete: "set null" }
    ),
    title: text("title").notNull(),
    documentType: text("document_type").notNull().default("corrective_action"),
    employeeName: text("employee_name"),
    /** Link to employees.id so we can update employee file (notes) and query by employee */
    employeeId: uuid("employee_id").references(() => employees.id, { onDelete: "set null" }),
    stage: text("stage").notNull().default("draft"),
    /** Which action items are done: { "sent_email": true, "scheduled_meeting": true } */
    completedActions: jsonb("completed_actions").default({}),
    /** Recipient email for automated delivery */
    employeeEmail: text("employee_email"),
    /** When the document email was sent */
    sentAt: timestamp("sent_at"),
    /** When the employee acknowledged receipt */
    acknowledgedAt: timestamp("acknowledged_at"),
    /** HMAC token for stateless acknowledgment verification */
    ackToken: text("ack_token"),
    /** When the last reminder was sent */
    reminderSentAt: timestamp("reminder_sent_at"),
    /** Number of reminders sent */
    reminderCount: integer("reminder_count").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("tracked_documents_workflow_run_idx").on(table.workflowRunId),
    index("tracked_documents_stage_idx").on(table.stage),
    index("tracked_documents_employee_id_idx").on(table.employeeId),
  ]
);

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type WorkflowDefinition = typeof workflowDefinitions.$inferSelect;
export type NewWorkflowDefinition = typeof workflowDefinitions.$inferInsert;

export type IntakeField = typeof intakeFields.$inferSelect;
export type NewIntakeField = typeof intakeFields.$inferInsert;

export type Guardrail = typeof guardrails.$inferSelect;
export type NewGuardrail = typeof guardrails.$inferInsert;

export type ArtifactTemplate = typeof artifactTemplates.$inferSelect;
export type NewArtifactTemplate = typeof artifactTemplates.$inferInsert;

export type TextLibrary = typeof textLibraries.$inferSelect;
export type NewTextLibrary = typeof textLibraries.$inferInsert;

export type WorkflowRun = typeof workflowRuns.$inferSelect;
export type NewWorkflowRun = typeof workflowRuns.$inferInsert;

export type WorkflowOutput = typeof workflowOutputs.$inferSelect;
export type NewWorkflowOutput = typeof workflowOutputs.$inferInsert;

export type AuditEvent = typeof auditEvents.$inferSelect;
export type NewAuditEvent = typeof auditEvents.$inferInsert;

export type GuidedAction = typeof guidedActions.$inferSelect;
export type NewGuidedAction = typeof guidedActions.$inferInsert;

export type TrackedDocument = typeof trackedDocuments.$inferSelect;
export type NewTrackedDocument = typeof trackedDocuments.$inferInsert;
