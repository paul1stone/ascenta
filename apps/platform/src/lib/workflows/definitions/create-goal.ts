/**
 * Create Goal Workflow
 * AI-guided goal creation for employee performance — per GROW-101, GROW-102, GROW-103.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const createGoalWorkflow: WorkflowDefinitionConfig = {
  slug: "create-goal",
  name: "Create Goal",
  description:
    "Guide a manager through creating a structured performance goal for an employee, with goal type selection, objective statement, key results, and support agreement.",
  category: "grow",
  audience: "manager",
  riskLevel: "low",
  estimatedMinutes: 10,
  icon: "Target",

  intakeFields: [
    // Employee Selection
    {
      fieldKey: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Which employee is this goal for?",
      helpText: "The AI will look up the employee by name.",
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

    // Goal Details
    {
      fieldKey: "objectiveStatement",
      label: "Objective Statement",
      type: "textarea",
      placeholder: "One sentence naming the outcome and why it matters (min 15 words)",
      required: true,
      sortOrder: 3,
      groupName: "Goal Details",
    },
    {
      fieldKey: "goalType",
      label: "Goal Type",
      type: "dropdown",
      required: true,
      sortOrder: 4,
      groupName: "Goal Details",
      options: [
        { value: "performance", label: "Performance Goal" },
        { value: "development", label: "Development Goal" },
      ],
    },

    // Time Period
    {
      fieldKey: "timePeriod",
      label: "Time Period",
      type: "dropdown",
      required: true,
      sortOrder: 5,
      groupName: "Timeline",
      options: [
        { value: "Q1", label: "Q1 (Jan-Mar)" },
        { value: "Q2", label: "Q2 (Apr-Jun)" },
        { value: "Q3", label: "Q3 (Jul-Sep)" },
        { value: "Q4", label: "Q4 (Oct-Dec)" },
        { value: "H1", label: "H1 (Jan-Jun)" },
        { value: "H2", label: "H2 (Jul-Dec)" },
        { value: "annual", label: "Full Year" },
        { value: "custom", label: "Custom Date Range" },
      ],
    },
    {
      fieldKey: "customStartDate",
      label: "Start Date",
      type: "date",
      required: false,
      sortOrder: 6,
      groupName: "Timeline",
      conditionalOn: {
        fieldKey: "timePeriod",
        operator: "equals",
        value: "custom",
      },
    },
    {
      fieldKey: "customEndDate",
      label: "End Date",
      type: "date",
      required: false,
      sortOrder: 7,
      groupName: "Timeline",
      conditionalOn: {
        fieldKey: "timePeriod",
        operator: "equals",
        value: "custom",
      },
    },

    // Cadence
    {
      fieldKey: "checkInCadence",
      label: "Check-in Cadence",
      type: "dropdown",
      required: true,
      sortOrder: 8,
      groupName: "Check-ins",
      options: [
        { value: "every_check_in", label: "Every Check-in" },
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
      ],
    },

    // Support
    {
      fieldKey: "supportAgreement",
      label: "Support Agreement",
      type: "textarea",
      placeholder: "What will the manager provide? (resources, access, time, coaching)",
      required: false,
      sortOrder: 9,
      groupName: "Support",
    },
  ],

  guardrails: [
    {
      id: "missing-objective-statement",
      name: "missing_objective_statement",
      description: "Goals must have an objective statement",
      triggerCondition: { field: "objectiveStatement", operator: "is_empty" },
      severity: "hard_stop",
      message: "A goal cannot be created without a defined objective statement.",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "missing-time-period",
      name: "missing_time_period",
      description: "Goals must have a time period",
      triggerCondition: { field: "timePeriod", operator: "is_empty" },
      severity: "hard_stop",
      message: "A goal must have a time period defined.",
      sortOrder: 2,
      isActive: true,
    },
  ],

  artifactTemplates: [],

  guidedActions: [
    {
      id: "suggest-goal-improvements",
      label: "Suggest goal improvements",
      description:
        "Get AI suggestions to make this goal more specific and measurable",
      icon: "Lightbulb",
      requiredInputs: ["objectiveStatement", "keyResults"],
      outputType: "analysis",
      promptTemplate:
        "Review this goal and suggest improvements to make it more SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Objective Statement: {{objectiveStatement}}. Key Results: {{keyResults}}.",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "leadership-library-guidance",
      label: "Leadership Library guidance",
      description:
        "Get relevant Leadership Library principles for this goal area",
      icon: "BookOpen",
      requiredInputs: ["goalType"],
      outputType: "analysis",
      promptTemplate:
        "Based on the goal type '{{goalType}}', suggest relevant leadership principles and development approaches from the Leadership Library that would help the employee succeed.",
      sortOrder: 2,
      isActive: true,
    },
  ],

  textLibraryEntries: [],
};
