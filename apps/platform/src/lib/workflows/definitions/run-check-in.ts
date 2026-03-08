/**
 * Run Check-In Workflow
 * AI-guided check-in completion — per GROW-104.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const runCheckInWorkflow: WorkflowDefinitionConfig = {
  slug: "run-check-in",
  name: "Run Check-In",
  description:
    "Guide a manager through a structured check-in conversation with an employee, documenting progress, blockers, coaching needs, and recognition.",
  category: "grow",
  audience: "manager",
  riskLevel: "low",
  estimatedMinutes: 10,
  icon: "CalendarCheck",

  intakeFields: [
    {
      fieldKey: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Which employee is this check-in for?",
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
      fieldKey: "linkedGoals",
      label: "Linked Goals",
      type: "checkbox_group",
      helpText: "Select the goals this check-in covers. The AI will show the employee's active goals.",
      required: true,
      sortOrder: 3,
      groupName: "Goals",
      options: [],
    },

    // Manager Prompts
    {
      fieldKey: "managerProgressObserved",
      label: "What progress do you see?",
      type: "textarea",
      placeholder: "Describe the progress you've observed since the last check-in",
      required: true,
      sortOrder: 4,
      groupName: "Manager Assessment",
    },
    {
      fieldKey: "managerCoachingNeeded",
      label: "What coaching is needed?",
      type: "textarea",
      placeholder: "Describe any coaching, support, or course correction needed",
      required: true,
      sortOrder: 5,
      groupName: "Manager Assessment",
    },
    {
      fieldKey: "managerRecognition",
      label: "What recognition should be given?",
      type: "textarea",
      placeholder: "Note any wins, effort, or behaviors worth recognizing",
      required: false,
      sortOrder: 6,
      groupName: "Manager Assessment",
    },

    // Employee Prompts
    {
      fieldKey: "employeeProgress",
      label: "What progress did you make?",
      type: "textarea",
      placeholder: "Employee's self-reported progress",
      required: true,
      sortOrder: 7,
      groupName: "Employee Input",
    },
    {
      fieldKey: "employeeObstacles",
      label: "What obstacles are you facing?",
      type: "textarea",
      placeholder: "Blockers, challenges, or risks the employee has identified",
      required: true,
      sortOrder: 8,
      groupName: "Employee Input",
    },
    {
      fieldKey: "employeeSupportNeeded",
      label: "What support do you need?",
      type: "textarea",
      placeholder: "Resources, help, or decisions the employee needs from their manager",
      required: true,
      sortOrder: 9,
      groupName: "Employee Input",
    },
  ],

  guardrails: [
    {
      id: "missing-manager-assessment",
      name: "missing_manager_assessment",
      description: "Manager must provide progress observation",
      triggerCondition: { field: "managerProgressObserved", operator: "is_empty" },
      severity: "hard_stop",
      message: "A check-in requires manager progress observations.",
      sortOrder: 1,
      isActive: true,
    },
  ],

  artifactTemplates: [],

  guidedActions: [
    {
      id: "coaching-suggestions",
      label: "Coaching suggestions",
      description: "Get AI-powered coaching suggestions based on the check-in so far",
      icon: "Lightbulb",
      requiredInputs: ["employeeProgress", "employeeObstacles"],
      outputType: "analysis",
      promptTemplate:
        "Based on this check-in data, suggest specific coaching actions for the manager. Employee progress: {{employeeProgress}}. Obstacles: {{employeeObstacles}}.",
      sortOrder: 1,
      isActive: true,
    },
  ],

  textLibraryEntries: [],
};
