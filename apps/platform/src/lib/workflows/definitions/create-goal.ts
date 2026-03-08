/**
 * Create Goal Workflow
 * AI-guided goal creation for employee performance — per GROW-101, GROW-102, GROW-103.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const createGoalWorkflow: WorkflowDefinitionConfig = {
  slug: "create-goal",
  name: "Create Goal",
  description:
    "Guide a manager through creating a structured performance goal for an employee, with category selection, measurement criteria, and alignment to company priorities.",
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
      fieldKey: "title",
      label: "Goal Title",
      type: "text",
      placeholder: "A short, clear title for this goal",
      helpText: "Example: 'Reduce ticket resolution time by 50%'",
      required: true,
      sortOrder: 3,
      groupName: "Goal Details",
    },
    {
      fieldKey: "description",
      label: "Goal Description",
      type: "textarea",
      placeholder: "Describe the goal in detail — what does success look like?",
      required: true,
      sortOrder: 4,
      groupName: "Goal Details",
    },

    // Category (GROW-102)
    {
      fieldKey: "categoryGroup",
      label: "Goal Category Group",
      type: "dropdown",
      required: true,
      sortOrder: 5,
      groupName: "Classification",
      options: [
        { value: "performance", label: "Performance Goals" },
        { value: "leadership", label: "Leadership Goals" },
        { value: "development", label: "Development Goals" },
      ],
    },
    {
      fieldKey: "category",
      label: "Specific Category",
      type: "dropdown",
      required: true,
      sortOrder: 6,
      groupName: "Classification",
      conditionalOn: {
        fieldKey: "categoryGroup",
        operator: "not_empty",
      },
      options: [
        // Performance
        { value: "productivity", label: "Productivity" },
        { value: "quality", label: "Quality" },
        { value: "accuracy", label: "Accuracy" },
        { value: "efficiency", label: "Efficiency" },
        { value: "operational_excellence", label: "Operational Excellence" },
        { value: "customer_impact", label: "Customer/Patient Impact" },
        // Leadership
        { value: "communication", label: "Communication" },
        { value: "collaboration", label: "Collaboration" },
        { value: "conflict_resolution", label: "Conflict Resolution" },
        { value: "decision_making", label: "Decision Making" },
        { value: "initiative", label: "Initiative" },
        // Development
        { value: "skill_development", label: "Skill Development" },
        { value: "certification", label: "Certification" },
        { value: "training_completion", label: "Training Completion" },
        { value: "leadership_growth", label: "Leadership Growth" },
        { value: "career_advancement", label: "Career Advancement" },
      ],
    },

    // Measurement (GROW-103)
    {
      fieldKey: "measurementType",
      label: "How will progress be measured?",
      type: "dropdown",
      required: true,
      sortOrder: 7,
      groupName: "Measurement",
      options: [
        { value: "numeric_metric", label: "Numeric Metric (e.g., reduce from X to Y)" },
        { value: "percentage_target", label: "Percentage Target (e.g., achieve 95%)" },
        {
          value: "milestone_completion",
          label: "Milestone Completion (e.g., launch by date)",
        },
        {
          value: "behavior_change",
          label: "Behavior Change (e.g., consistently demonstrates X)",
        },
        {
          value: "learning_completion",
          label: "Learning Completion (e.g., finish course/cert)",
        },
      ],
    },
    {
      fieldKey: "successMetric",
      label: "Success Metric",
      type: "textarea",
      placeholder: "Define the specific, measurable target",
      helpText:
        "Be specific: 'Reduce average resolution time from 48h to 24h for 4 consecutive weeks'",
      required: true,
      sortOrder: 8,
      groupName: "Measurement",
    },

    // Time Period
    {
      fieldKey: "timePeriod",
      label: "Time Period",
      type: "dropdown",
      required: true,
      sortOrder: 9,
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
      sortOrder: 10,
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
      sortOrder: 11,
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
      sortOrder: 12,
      groupName: "Check-ins",
      options: [
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "milestone", label: "At Milestones" },
        { value: "manager_scheduled", label: "Manager Scheduled" },
      ],
    },

    // Alignment
    {
      fieldKey: "alignment",
      label: "What does this goal align to?",
      type: "dropdown",
      required: true,
      sortOrder: 13,
      groupName: "Alignment",
      options: [
        { value: "mission", label: "Company Mission" },
        { value: "value", label: "Company Value/Principle" },
        { value: "priority", label: "Strategic Priority" },
      ],
    },
  ],

  guardrails: [
    {
      id: "missing-success-metric",
      name: "missing_success_metric",
      description: "Goals must have a measurable success metric",
      triggerCondition: { field: "successMetric", operator: "is_empty" },
      severity: "hard_stop",
      message: "A goal cannot be created without a defined success metric.",
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
      requiredInputs: ["title", "description"],
      outputType: "analysis",
      promptTemplate:
        "Review this goal and suggest improvements to make it more SMART (Specific, Measurable, Achievable, Relevant, Time-bound). Goal title: {{title}}. Description: {{description}}. Category: {{category}}.",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "leadership-library-guidance",
      label: "Leadership Library guidance",
      description:
        "Get relevant Leadership Library principles for this goal area",
      icon: "BookOpen",
      requiredInputs: ["category"],
      outputType: "analysis",
      promptTemplate:
        "Based on the goal category '{{category}}', suggest relevant leadership principles and development approaches from the Leadership Library that would help the employee succeed.",
      sortOrder: 2,
      isActive: true,
    },
  ],

  textLibraryEntries: [],
};
