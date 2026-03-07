/**
 * Add Performance Note Workflow
 * AI-guided manager observation/feedback capture — per GROW teaching moments.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const addPerformanceNoteWorkflow: WorkflowDefinitionConfig = {
  slug: "add-performance-note",
  name: "Add Performance Note",
  description:
    "Capture a coaching moment, observation, or feedback about an employee. Notes are stored in the employee's record and visible during reviews.",
  category: "grow",
  audience: "manager",
  riskLevel: "low",
  estimatedMinutes: 5,
  icon: "FileText",

  intakeFields: [
    {
      fieldKey: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Which employee is this note about?",
      required: true,
      sortOrder: 1,
      groupName: "Employee",
    },
    {
      fieldKey: "employeeId",
      label: "Employee ID",
      type: "text",
      required: true,
      sortOrder: 2,
      groupName: "Employee",
    },
    {
      fieldKey: "noteType",
      label: "Note Type",
      type: "dropdown",
      required: true,
      sortOrder: 3,
      groupName: "Note Details",
      options: [
        { value: "observation", label: "Observation" },
        { value: "feedback", label: "Feedback" },
        { value: "coaching", label: "Coaching Moment" },
        { value: "recognition", label: "Recognition" },
        { value: "concern", label: "Concern" },
      ],
    },
    {
      fieldKey: "observation",
      label: "What happened?",
      type: "textarea",
      placeholder: "Describe the situation — what did you observe?",
      helpText: "Be specific: who, what, when, where. Stick to facts.",
      required: true,
      sortOrder: 4,
      groupName: "Note Details",
    },
    {
      fieldKey: "expectation",
      label: "Expectation or Feedback",
      type: "textarea",
      placeholder: "What was the expectation, or what feedback was given?",
      required: false,
      sortOrder: 5,
      groupName: "Note Details",
    },
    {
      fieldKey: "followUp",
      label: "Follow-up needed?",
      type: "dropdown",
      required: false,
      sortOrder: 6,
      groupName: "Note Details",
      options: [
        { value: "none", label: "No follow-up needed" },
        { value: "check_in", label: "Schedule a follow-up check-in" },
        { value: "goal", label: "Create a related goal" },
        { value: "escalate", label: "Escalate to HR" },
      ],
    },
  ],

  guardrails: [],
  artifactTemplates: [],
  guidedActions: [
    {
      id: "rewrite-objectively",
      label: "Help me write this objectively",
      description: "Get AI help writing a factual, objective note",
      icon: "PenLine",
      requiredInputs: ["observation"],
      outputType: "rewrite",
      promptTemplate:
        "Rewrite this performance note to be more objective, factual, and professionally documented. Keep the key facts but remove subjective language. Original: {{observation}}",
      sortOrder: 1,
      isActive: true,
    },
  ],
  textLibraryEntries: [],
};
