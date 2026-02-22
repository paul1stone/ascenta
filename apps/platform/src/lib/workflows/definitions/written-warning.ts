/**
 * Written Warning (Corrective Action) Workflow
 * Generates a formal written warning document for employee discipline
 */

import type { WorkflowDefinitionConfig } from "../types";
import { and, isEmpty, equals } from "../guardrails";

export const writtenWarningWorkflow: WorkflowDefinitionConfig = {
  slug: "written-warning",
  name: "Written Warning",
  description:
    "Generate a formal written warning letter for employee corrective action. Ensures proper documentation and compliance.",
  category: "corrective",
  audience: "manager",
  riskLevel: "medium",
  estimatedMinutes: 15,
  icon: "AlertTriangle",

  intakeFields: [
    // Employee Information
    {
      fieldKey: "employeeName",
      label: "Employee Name",
      type: "text",
      placeholder: "Enter employee's full name",
      required: true,
      sortOrder: 1,
      groupName: "Employee Information",
    },
    {
      fieldKey: "employeeId",
      label: "Employee ID",
      type: "text",
      placeholder: "Enter employee ID",
      required: true,
      sortOrder: 2,
      groupName: "Employee Information",
    },
    {
      fieldKey: "department",
      label: "Department",
      type: "text",
      placeholder: "Enter department name",
      required: true,
      sortOrder: 3,
      groupName: "Employee Information",
    },
    {
      fieldKey: "jobTitle",
      label: "Job Title",
      type: "text",
      placeholder: "Enter job title",
      required: true,
      sortOrder: 4,
      groupName: "Employee Information",
    },
    {
      fieldKey: "managerName",
      label: "Manager Name",
      type: "text",
      placeholder: "Enter direct manager's name",
      required: true,
      sortOrder: 5,
      groupName: "Employee Information",
    },

    // Issue Details
    {
      fieldKey: "issueCategory",
      label: "Issue Category",
      type: "dropdown",
      required: true,
      sortOrder: 6,
      groupName: "Issue Details",
      options: [
        { value: "attendance", label: "Attendance" },
        { value: "performance", label: "Performance" },
        { value: "conduct", label: "Conduct/Behavior" },
        { value: "policy_violation", label: "Policy Violation" },
        { value: "safety", label: "Safety Violation" },
        { value: "other", label: "Other" },
      ],
    },
    {
      fieldKey: "incidentDate",
      label: "Incident Date",
      type: "date",
      helpText: "Date when the incident occurred",
      required: true,
      sortOrder: 7,
      groupName: "Issue Details",
    },
    {
      fieldKey: "incidentDescription",
      label: "Incident Description",
      type: "textarea",
      placeholder: "Describe the specific incident or behavior that led to this warning",
      helpText: "Be specific and factual. Include dates, times, and observable behaviors.",
      required: true,
      sortOrder: 8,
      groupName: "Issue Details",
      validationRules: {
        minLength: 50,
        maxLength: 2000,
      },
    },
    {
      fieldKey: "witnesses",
      label: "Witnesses (if any)",
      type: "textarea",
      placeholder: "List any witnesses to the incident",
      required: false,
      sortOrder: 9,
      groupName: "Issue Details",
    },

    // Prior Discipline
    {
      fieldKey: "priorDiscipline",
      label: "Prior Discipline History",
      type: "checkbox_group",
      helpText: "Select all prior discipline this employee has received",
      required: false,
      sortOrder: 10,
      groupName: "Prior Discipline",
      options: [
        { value: "verbal_warning", label: "Verbal Warning" },
        { value: "written_warning", label: "Written Warning" },
        { value: "final_warning", label: "Final Written Warning" },
        { value: "suspension", label: "Suspension" },
        { value: "pip", label: "Performance Improvement Plan" },
      ],
    },
    {
      fieldKey: "priorDisciplineDetails",
      label: "Prior Discipline Details",
      type: "textarea",
      placeholder: "Provide details about prior discipline (dates, issues)",
      required: false,
      sortOrder: 11,
      groupName: "Prior Discipline",
    },

    // Warning Level
    {
      fieldKey: "warningLevel",
      label: "Warning Level",
      type: "dropdown",
      required: true,
      sortOrder: 12,
      groupName: "Warning Details",
      options: [
        { value: "verbal", label: "Verbal Warning (documented)" },
        { value: "first_written", label: "First Written Warning" },
        { value: "second_written", label: "Second Written Warning" },
        { value: "final", label: "Final Written Warning" },
      ],
    },

    // Expectations & Improvement
    {
      fieldKey: "expectedBehavior",
      label: "Expected Behavior/Performance",
      type: "textarea",
      placeholder: "Describe the specific, measurable expectations",
      helpText: "Include clear, actionable requirements for improvement",
      required: true,
      sortOrder: 13,
      groupName: "Expectations",
      validationRules: {
        minLength: 30,
      },
    },
    {
      fieldKey: "improvementPeriod",
      label: "Improvement Period",
      type: "dropdown",
      required: true,
      sortOrder: 14,
      groupName: "Expectations",
      options: [
        { value: "immediate", label: "Immediate" },
        { value: "30_days", label: "30 Days" },
        { value: "60_days", label: "60 Days" },
        { value: "90_days", label: "90 Days" },
      ],
    },
    {
      fieldKey: "supportOffered",
      label: "Support to be Provided",
      type: "textarea",
      placeholder: "Describe any training, resources, or support being offered",
      required: false,
      sortOrder: 15,
      groupName: "Expectations",
    },

    // Consequences
    {
      fieldKey: "consequences",
      label: "Consequences for Failure to Improve",
      type: "checkbox_group",
      helpText: "Select potential consequences if improvement is not achieved",
      required: true,
      sortOrder: 16,
      groupName: "Consequences",
      options: [
        { value: "additional_warning", label: "Additional Written Warning" },
        { value: "final_warning", label: "Final Written Warning" },
        { value: "suspension", label: "Suspension" },
        { value: "demotion", label: "Demotion" },
        { value: "termination", label: "Termination of Employment" },
      ],
    },
  ],

  guardrails: [
    {
      id: "final-warning-no-prior",
      name: "Final Warning Without Prior Discipline",
      description:
        "Issuing a final warning without prior documented discipline may create compliance risk",
      triggerCondition: and(
        equals("warningLevel", "final"),
        isEmpty("priorDiscipline")
      ),
      severity: "warning",
      message:
        "You are issuing a final warning without documented prior discipline. Please provide a rationale for this escalation.",
      requiredAction: "rationale",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "termination-consequence",
      name: "Termination as Consequence",
      description: "Documents mentioning termination should be reviewed by HR",
      triggerCondition: {
        field: "consequences",
        operator: "contains",
        value: "termination",
      },
      severity: "escalation",
      message:
        "This warning includes termination as a potential consequence. HR review is recommended before issuing.",
      requiredAction: "hr_review",
      escalateTo: "HR",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "missing-expectations",
      name: "Expectations Must Be Measurable",
      description: "Expected behavior must be specific and measurable",
      triggerCondition: {
        field: "expectedBehavior",
        operator: "is_empty",
      },
      severity: "hard_stop",
      message:
        "You must provide specific, measurable expectations for the employee to improve.",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "safety-violation-escalation",
      name: "Safety Violation Escalation",
      description: "Safety violations may require additional review",
      triggerCondition: equals("issueCategory", "safety"),
      severity: "warning",
      message:
        "Safety violations may have additional reporting requirements. Ensure compliance with your organization's safety protocols.",
      sortOrder: 4,
      isActive: true,
    },
  ],

  artifactTemplates: [
    {
      id: "written-warning-letter",
      name: "Written Warning Letter",
      type: "letter",
      exportFormats: ["pdf", "docx"],
      sections: [
        {
          key: "header",
          title: "Document Header",
          locked: true,
          content: `CONFIDENTIAL - EMPLOYEE PERSONNEL FILE

Date: {{currentDate}}

TO: {{employeeName}}
Employee ID: {{employeeId}}
Department: {{department}}
Position: {{jobTitle}}

FROM: {{managerName}}
RE: Written Warning - {{issueCategory}}`,
        },
        {
          key: "purpose",
          title: "Purpose of This Warning",
          locked: true,
          content: `This letter serves as a formal {{warningLevel}} regarding your {{issueCategory}}. The purpose of this warning is to document the issue, establish clear expectations, and provide you with the opportunity to improve.`,
        },
        {
          key: "incident",
          title: "Description of Issue",
          locked: false,
          aiPrompt: `Based on the incident description provided, write a professional, objective summary of the issue. Include:
- The specific date(s) and nature of the incident
- Observable facts and behaviors (not assumptions)
- Impact on the team, department, or organization
- Any relevant context

Input description: {{incidentDescription}}
{{#if witnesses}}Witnesses: {{witnesses}}{{/if}}`,
        },
        {
          key: "prior_discipline",
          title: "Prior Discipline History",
          locked: false,
          aiPrompt: `Summarize the employee's prior discipline history in a factual manner. If no prior discipline exists, state that this is the first documented incident.

Prior discipline: {{priorDiscipline}}
Details: {{priorDisciplineDetails}}`,
        },
        {
          key: "expectations",
          title: "Expectations for Improvement",
          locked: false,
          aiPrompt: `Write a clear, professional statement of expectations. The expectations should be:
- Specific and measurable
- Time-bound (within the improvement period)
- Realistic and achievable

Expected behavior provided: {{expectedBehavior}}
Improvement period: {{improvementPeriod}}
Support offered: {{supportOffered}}`,
        },
        {
          key: "consequences",
          title: "Consequences",
          locked: true,
          textLibraryKeys: ["consequences_standard"],
          content: `Failure to meet the expectations outlined above within the specified timeframe may result in further disciplinary action, up to and including {{consequences}}.`,
        },
        {
          key: "acknowledgment",
          title: "Acknowledgment",
          locked: true,
          content: `Your signature below indicates that you have received and read this warning. It does not necessarily indicate agreement with its contents. You have the right to submit a written response within five (5) business days, which will be attached to this document in your personnel file.

Employee Signature: _________________________ Date: _____________

Manager Signature: _________________________ Date: _____________

HR Representative: _________________________ Date: _____________`,
        },
      ],
    },
  ],

  guidedActions: [
    {
      id: "summarize-incident",
      label: "Summarize this incident professionally",
      description: "Turn the incident description into a formal summary",
      icon: "FileText",
      requiredInputs: ["incidentDescription"],
      outputType: "rewrite",
      outputTarget: "incident",
      promptTemplate: `Rewrite the following incident description in a professional, objective tone suitable for a formal HR document. Remove any emotional language and focus on observable facts.

Original: {{incidentDescription}}`,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "identify-gaps",
      label: "What information is missing?",
      description: "Analyze inputs for completeness",
      icon: "Search",
      requiredInputs: [],
      outputType: "analysis",
      promptTemplate: `Analyze the following written warning information and identify any gaps or areas that need more detail:

Employee: {{employeeName}}
Issue: {{issueCategory}}
Description: {{incidentDescription}}
Prior discipline: {{priorDiscipline}}
Expectations: {{expectedBehavior}}

List specific questions or information that should be gathered before finalizing this warning.`,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "suggest-expectations",
      label: "Suggest improvement expectations",
      description: "Generate specific, measurable expectations",
      icon: "Target",
      requiredInputs: ["issueCategory", "incidentDescription"],
      outputType: "artifact",
      outputTarget: "expectedBehavior",
      promptTemplate: `Based on the issue category ({{issueCategory}}) and incident description, suggest 3-5 specific, measurable expectations for the employee. Each expectation should be:
- Observable and measurable
- Achievable within a reasonable timeframe
- Directly related to the issue

Incident: {{incidentDescription}}`,
      sortOrder: 3,
      isActive: true,
    },
  ],

  textLibraryEntries: [
    {
      category: "consequences",
      key: "consequences_standard",
      title: "Standard Consequences Language",
      content:
        "Failure to meet these expectations may result in further disciplinary action, up to and including termination of employment.",
    },
    {
      category: "expectations",
      key: "attendance_expectations",
      title: "Attendance Expectations",
      content:
        "You are expected to report to work on time for all scheduled shifts. Any absence must be reported to your supervisor at least one hour before your scheduled start time, except in cases of emergency.",
    },
    {
      category: "expectations",
      key: "performance_expectations",
      title: "Performance Expectations",
      content:
        "You are expected to meet the performance standards outlined in your job description and discussed during your performance reviews.",
    },
  ],
};
