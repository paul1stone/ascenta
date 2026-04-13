/**
 * Run Check-In Workflow
 * Schedules a lifecycle check-in (prepare → participate → reflect) — per GROW-104.
 */

import type { WorkflowDefinitionConfig } from "../types";

export const runCheckInWorkflow: WorkflowDefinitionConfig = {
  slug: "run-check-in",
  name: "Run Check-In",
  description:
    "Schedule a lifecycle check-in for an employee. The check-in follows a prepare → participate → reflect flow with gap signal analysis.",
  category: "grow",
  audience: "manager",
  riskLevel: "low",
  estimatedMinutes: 5,
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
      fieldKey: "scheduledAt",
      label: "Scheduled Date",
      type: "text",
      helpText: "When to schedule the check-in (ISO date). Defaults to 48 hours from now.",
      required: false,
      sortOrder: 3,
      groupName: "Scheduling",
    },
  ],

  guardrails: [
    {
      id: "missing-employee-name",
      name: "missing_employee_name",
      description: "Employee name must be provided",
      triggerCondition: { field: "employeeName", operator: "is_empty" },
      severity: "hard_stop",
      message: "A check-in requires an employee name.",
      sortOrder: 1,
      isActive: true,
    },
  ],

  artifactTemplates: [],

  guidedActions: [],

  textLibraryEntries: [],
};
