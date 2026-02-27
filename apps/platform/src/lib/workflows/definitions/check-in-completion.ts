/**
 * Check-In Completion Workflow
 * Guided check-in flow for recording progress against a goal
 */

import type { WorkflowDefinitionConfig } from "../types";
import { isEmpty } from "../guardrails";

export const checkInCompletionWorkflow: WorkflowDefinitionConfig = {
  slug: "check-in-completion",
  name: "Check-In Completion",
  description: "Guided check-in flow for recording progress against a goal",
  category: "grow",
  audience: "employee",
  riskLevel: "low",
  estimatedMinutes: 5,
  icon: "CheckCircle",

  intakeFields: [
    {
      fieldKey: "goalId",
      label: "Goal",
      type: "dropdown",
      placeholder: "Select the goal for this check-in",
      required: true,
      sortOrder: 1,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "progress",
      label: "What progress have you made?",
      type: "textarea",
      placeholder: "Describe the progress since your last check-in",
      required: true,
      validationRules: { minLength: 10 },
      sortOrder: 2,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "blockers",
      label: "Any blockers?",
      type: "textarea",
      placeholder: "What's standing in your way? (optional)",
      required: false,
      sortOrder: 3,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "supportNeeded",
      label: "Support needed from your manager?",
      type: "textarea",
      placeholder: "What help would make a difference? (optional)",
      required: false,
      sortOrder: 4,
      groupName: "Check-In Details",
    },
    {
      fieldKey: "rating",
      label: "How is this goal tracking?",
      type: "dropdown",
      options: [
        { value: "on_track", label: "On Track" },
        { value: "at_risk", label: "At Risk" },
        { value: "off_track", label: "Off Track" },
      ],
      required: true,
      sortOrder: 5,
      groupName: "Assessment",
    },
  ],

  guardrails: [
    {
      id: "progress-required",
      name: "Progress Required",
      description: "Check-in must include a progress update",
      triggerCondition: isEmpty("progress"),
      severity: "hard_stop",
      message: "A progress update is required to complete the check-in.",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "off-track-support",
      name: "Off Track Support Suggestion",
      description: "Suggest noting support needed when goal is off track",
      triggerCondition: {
        field: "rating",
        operator: "equals",
        value: "off_track",
        and: [{ field: "supportNeeded", operator: "is_empty" }],
      },
      severity: "warning",
      message:
        "This goal is off track. Consider noting what support from your manager would help.",
      sortOrder: 2,
      isActive: true,
    },
  ],

  artifactTemplates: [],

  guidedActions: [
    {
      id: "summarize-progress",
      label: "Summarize progress objectively",
      description: "Rewrite your progress notes in clear, objective terms",
      icon: "FileText",
      requiredInputs: ["progress"],
      outputType: "rewrite",
      outputTarget: "progress",
      promptTemplate:
        "Rewrite this progress update in clear, objective, professional terms. Focus on observable outcomes and measurable progress. Original: {{progress}}",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "suggest-followups",
      label: "Suggest follow-up actions",
      description: "Get AI-suggested next steps based on your blockers",
      icon: "Lightbulb",
      requiredInputs: ["blockers"],
      outputType: "analysis",
      promptTemplate:
        "Based on these blockers, suggest 2-3 concrete follow-up actions the employee or manager could take: {{blockers}}",
      sortOrder: 2,
      isActive: true,
    },
  ],
};
