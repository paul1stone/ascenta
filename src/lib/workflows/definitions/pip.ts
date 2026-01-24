/**
 * Performance Improvement Plan (PIP) Workflow
 * Generates a structured performance improvement plan document
 */

import type { WorkflowDefinitionConfig } from "../types";
import { isEmpty, and, equals } from "../guardrails";

export const pipWorkflow: WorkflowDefinitionConfig = {
  slug: "pip",
  name: "Performance Improvement Plan",
  description:
    "Create a structured 30/60/90 day performance improvement plan with clear goals, milestones, and support resources.",
  category: "performance",
  audience: "manager",
  riskLevel: "high",
  estimatedMinutes: 25,
  icon: "TrendingUp",

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
      required: true,
      sortOrder: 3,
      groupName: "Employee Information",
    },
    {
      fieldKey: "jobTitle",
      label: "Job Title",
      type: "text",
      required: true,
      sortOrder: 4,
      groupName: "Employee Information",
    },
    {
      fieldKey: "hireDate",
      label: "Hire Date",
      type: "date",
      required: true,
      sortOrder: 5,
      groupName: "Employee Information",
    },
    {
      fieldKey: "managerName",
      label: "Manager Name",
      type: "text",
      required: true,
      sortOrder: 6,
      groupName: "Employee Information",
    },

    // Performance Issues
    {
      fieldKey: "performanceAreas",
      label: "Performance Deficiency Areas",
      type: "checkbox_group",
      helpText: "Select all areas where performance is below expectations",
      required: true,
      sortOrder: 7,
      groupName: "Performance Issues",
      options: [
        { value: "quality", label: "Quality of Work" },
        { value: "productivity", label: "Productivity/Output" },
        { value: "communication", label: "Communication" },
        { value: "attendance", label: "Attendance/Punctuality" },
        { value: "teamwork", label: "Teamwork/Collaboration" },
        { value: "customer_service", label: "Customer Service" },
        { value: "technical_skills", label: "Technical Skills" },
        { value: "leadership", label: "Leadership/Management" },
        { value: "decision_making", label: "Decision Making" },
        { value: "adaptability", label: "Adaptability" },
      ],
    },
    {
      fieldKey: "performanceDetails",
      label: "Detailed Performance Description",
      type: "textarea",
      placeholder:
        "Describe the specific performance issues with examples, dates, and measurable gaps",
      helpText:
        "Include specific examples with dates. Compare actual performance to expected standards.",
      required: true,
      sortOrder: 8,
      groupName: "Performance Issues",
      validationRules: {
        minLength: 100,
        maxLength: 3000,
      },
    },

    // Prior Coaching
    {
      fieldKey: "priorCoaching",
      label: "Prior Coaching/Feedback",
      type: "checkbox_group",
      helpText: "Select all prior coaching actions taken",
      required: false,
      sortOrder: 9,
      groupName: "Prior Actions",
      options: [
        { value: "verbal_feedback", label: "Verbal Feedback" },
        { value: "documented_coaching", label: "Documented Coaching Conversation" },
        { value: "performance_review", label: "Performance Review Discussion" },
        { value: "training", label: "Additional Training Provided" },
        { value: "written_warning", label: "Written Warning Issued" },
      ],
    },
    {
      fieldKey: "coachingDetails",
      label: "Coaching History Details",
      type: "textarea",
      placeholder: "Provide dates and details of prior coaching efforts",
      required: false,
      sortOrder: 10,
      groupName: "Prior Actions",
    },

    // PIP Configuration
    {
      fieldKey: "pipDuration",
      label: "PIP Duration",
      type: "dropdown",
      required: true,
      sortOrder: 11,
      groupName: "PIP Configuration",
      options: [
        { value: "30", label: "30 Days" },
        { value: "60", label: "60 Days" },
        { value: "90", label: "90 Days" },
      ],
    },
    {
      fieldKey: "startDate",
      label: "PIP Start Date",
      type: "date",
      required: true,
      sortOrder: 12,
      groupName: "PIP Configuration",
    },

    // Goals & Milestones
    {
      fieldKey: "goal1",
      label: "Goal 1",
      type: "textarea",
      placeholder:
        "Enter a specific, measurable goal (e.g., 'Reduce error rate from 15% to less than 5%')",
      helpText: "Goals should be SMART: Specific, Measurable, Achievable, Relevant, Time-bound",
      required: true,
      sortOrder: 13,
      groupName: "Goals & Milestones",
      validationRules: {
        minLength: 20,
      },
    },
    {
      fieldKey: "goal1Metrics",
      label: "Goal 1 - Success Metrics",
      type: "textarea",
      placeholder: "How will success be measured for this goal?",
      required: true,
      sortOrder: 14,
      groupName: "Goals & Milestones",
    },
    {
      fieldKey: "goal2",
      label: "Goal 2",
      type: "textarea",
      placeholder: "Enter a second specific, measurable goal",
      required: true,
      sortOrder: 15,
      groupName: "Goals & Milestones",
      validationRules: {
        minLength: 20,
      },
    },
    {
      fieldKey: "goal2Metrics",
      label: "Goal 2 - Success Metrics",
      type: "textarea",
      placeholder: "How will success be measured for this goal?",
      required: true,
      sortOrder: 16,
      groupName: "Goals & Milestones",
    },
    {
      fieldKey: "goal3",
      label: "Goal 3 (Optional)",
      type: "textarea",
      placeholder: "Enter an additional goal if needed",
      required: false,
      sortOrder: 17,
      groupName: "Goals & Milestones",
    },
    {
      fieldKey: "goal3Metrics",
      label: "Goal 3 - Success Metrics",
      type: "textarea",
      placeholder: "How will success be measured?",
      required: false,
      sortOrder: 18,
      groupName: "Goals & Milestones",
      conditionalOn: {
        fieldKey: "goal3",
        operator: "not_empty",
      },
    },

    // Support & Resources
    {
      fieldKey: "supportResources",
      label: "Support & Resources to be Provided",
      type: "checkbox_group",
      helpText: "Select all support that will be offered",
      required: true,
      sortOrder: 19,
      groupName: "Support",
      options: [
        { value: "training", label: "Additional Training" },
        { value: "mentoring", label: "Mentoring/Coaching" },
        { value: "weekly_checkins", label: "Weekly Check-in Meetings" },
        { value: "tools", label: "Additional Tools/Resources" },
        { value: "reduced_workload", label: "Temporarily Reduced Workload" },
        { value: "shadowing", label: "Job Shadowing Opportunity" },
      ],
    },
    {
      fieldKey: "supportDetails",
      label: "Support Details",
      type: "textarea",
      placeholder: "Describe the specific support and resources that will be provided",
      required: true,
      sortOrder: 20,
      groupName: "Support",
    },
    {
      fieldKey: "checkInFrequency",
      label: "Check-in Frequency",
      type: "dropdown",
      required: true,
      sortOrder: 21,
      groupName: "Support",
      options: [
        { value: "daily", label: "Daily" },
        { value: "twice_weekly", label: "Twice Weekly" },
        { value: "weekly", label: "Weekly" },
        { value: "biweekly", label: "Bi-Weekly" },
      ],
    },
  ],

  guardrails: [
    {
      id: "goals-must-have-metrics",
      name: "Goals Must Have Measurable Metrics",
      description: "Each goal must have associated success metrics",
      triggerCondition: {
        field: "goal1Metrics",
        operator: "is_empty",
        and: [{ field: "goal1", operator: "is_not_empty" }],
      },
      severity: "hard_stop",
      message: "Each goal must have measurable success metrics defined.",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "no-prior-coaching",
      name: "No Prior Coaching Documented",
      description: "PIPs should typically follow coaching efforts",
      triggerCondition: isEmpty("priorCoaching"),
      severity: "warning",
      message:
        "No prior coaching has been documented. Consider whether coaching should precede a formal PIP, or provide rationale for proceeding.",
      requiredAction: "rationale",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "short-pip-high-issues",
      name: "Short Duration for Multiple Issues",
      description: "30-day PIPs may be insufficient for multiple performance areas",
      triggerCondition: and(
        equals("pipDuration", "30"),
        { field: "performanceAreas", operator: "is_not_empty" }
        // Ideally would check length > 3, simplified here
      ),
      severity: "warning",
      message:
        "A 30-day PIP may not provide sufficient time to address multiple performance areas. Consider extending the duration.",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "support-required",
      name: "Support Resources Required",
      description: "PIPs should include support resources",
      triggerCondition: isEmpty("supportResources"),
      severity: "hard_stop",
      message:
        "A Performance Improvement Plan must include support resources for the employee.",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: "pip-after-warning",
      name: "PIP Following Written Warning",
      description: "PIPs following written warnings are higher risk",
      triggerCondition: {
        field: "priorCoaching",
        operator: "contains",
        value: "written_warning",
      },
      severity: "escalation",
      message:
        "This PIP follows a written warning. HR review is recommended to ensure proper documentation.",
      requiredAction: "hr_review",
      escalateTo: "HR",
      sortOrder: 5,
      isActive: true,
    },
  ],

  artifactTemplates: [
    {
      id: "pip-document",
      name: "Performance Improvement Plan",
      type: "memo",
      exportFormats: ["pdf", "docx"],
      sections: [
        {
          key: "header",
          title: "Document Header",
          locked: true,
          content: `CONFIDENTIAL - PERFORMANCE IMPROVEMENT PLAN

Employee: {{employeeName}} (ID: {{employeeId}})
Department: {{department}}
Position: {{jobTitle}}
Hire Date: {{hireDate}}
Manager: {{managerName}}
PIP Duration: {{pipDuration}} Days
Start Date: {{startDate}}
End Date: [Calculated {{pipDuration}} days from start]`,
        },
        {
          key: "purpose",
          title: "Purpose",
          locked: true,
          content: `This Performance Improvement Plan (PIP) is designed to provide you with clear expectations, goals, and support to help you succeed in your role. The company is committed to your development and success, and this plan outlines the steps both you and your manager will take during this period.`,
        },
        {
          key: "current_performance",
          title: "Current Performance Assessment",
          locked: false,
          aiPrompt: `Write a professional, objective assessment of the employee's current performance challenges. Include:
- The specific performance areas requiring improvement
- Concrete examples and evidence of performance gaps
- The impact on the team/organization
- Acknowledgment of any prior coaching

Performance areas: {{performanceAreas}}
Details: {{performanceDetails}}
Prior coaching: {{priorCoaching}}
Coaching details: {{coachingDetails}}`,
        },
        {
          key: "goals",
          title: "Performance Goals",
          locked: false,
          aiPrompt: `Format the following goals into a clear, structured performance improvement plan. For each goal, include:
- The goal statement
- How success will be measured
- Any interim milestones

Goal 1: {{goal1}}
Metrics: {{goal1Metrics}}

Goal 2: {{goal2}}
Metrics: {{goal2Metrics}}

{{#if goal3}}
Goal 3: {{goal3}}
Metrics: {{goal3Metrics}}
{{/if}}`,
        },
        {
          key: "timeline",
          title: "Timeline & Milestones",
          locked: false,
          aiPrompt: `Create a timeline for this {{pipDuration}}-day PIP starting {{startDate}}. Include:
- Weekly milestones or checkpoints
- Check-in schedule ({{checkInFrequency}})
- Mid-point review date
- Final evaluation date

Base the milestones on the goals provided.`,
        },
        {
          key: "support",
          title: "Support & Resources",
          locked: false,
          aiPrompt: `Describe the support and resources that will be provided to help the employee succeed:

Selected support: {{supportResources}}
Details: {{supportDetails}}
Check-in frequency: {{checkInFrequency}}

Format this as a clear list of commitments from the manager/organization.`,
        },
        {
          key: "consequences",
          title: "Outcomes",
          locked: true,
          content: `At the conclusion of this Performance Improvement Plan:

**Successful Completion:** If you meet all goals and demonstrate sustained improvement, the PIP will be closed successfully and documented in your personnel file.

**Partial Improvement:** If significant progress is made but goals are not fully met, the PIP may be extended at management's discretion.

**Failure to Improve:** If performance goals are not met and/or insufficient progress is demonstrated, further disciplinary action may be taken, up to and including termination of employment.`,
        },
        {
          key: "acknowledgment",
          title: "Acknowledgment",
          locked: true,
          content: `By signing below, you acknowledge that you have received this Performance Improvement Plan, that it has been discussed with you, and that you understand the expectations and potential consequences outlined above.

Your signature does not indicate agreement with the assessment, and you have the right to submit a written response within five (5) business days.

Employee Signature: _________________________ Date: _____________

Manager Signature: _________________________ Date: _____________

HR Representative: _________________________ Date: _____________

Next Check-in Date: _________________________`,
        },
      ],
    },
  ],

  guidedActions: [
    {
      id: "assess-performance",
      label: "Write professional performance assessment",
      description: "Convert notes into formal assessment language",
      icon: "ClipboardList",
      requiredInputs: ["performanceDetails", "performanceAreas"],
      outputType: "rewrite",
      outputTarget: "current_performance",
      promptTemplate: `Rewrite the following performance observations into a professional, objective assessment suitable for a formal PIP document. Use neutral language and focus on observable behaviors and measurable outcomes.

Performance areas: {{performanceAreas}}
Details: {{performanceDetails}}`,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "make-goals-smart",
      label: "Convert goals to SMART format",
      description: "Ensure goals are Specific, Measurable, Achievable, Relevant, Time-bound",
      icon: "Target",
      requiredInputs: ["goal1", "pipDuration"],
      outputType: "rewrite",
      promptTemplate: `Review and rewrite these goals to ensure they are SMART (Specific, Measurable, Achievable, Relevant, Time-bound):

Goal 1: {{goal1}}
Goal 2: {{goal2}}
{{#if goal3}}Goal 3: {{goal3}}{{/if}}

Duration: {{pipDuration}} days

For each goal, provide:
1. A revised SMART goal statement
2. Suggested success metrics
3. Weekly milestones`,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "suggest-support",
      label: "Suggest appropriate support resources",
      description: "Recommend support based on performance areas",
      icon: "HeartHandshake",
      requiredInputs: ["performanceAreas"],
      outputType: "analysis",
      promptTemplate: `Based on the following performance areas requiring improvement, suggest specific support resources and interventions:

Performance areas: {{performanceAreas}}

For each area, recommend:
- Specific training or learning resources
- Coaching approaches
- Tools or process changes
- Mentoring opportunities`,
      sortOrder: 3,
      isActive: true,
    },
  ],

  textLibraryEntries: [
    {
      category: "expectations",
      key: "pip_quality_expectations",
      title: "Quality Improvement Expectations",
      content:
        "Work product must meet departmental quality standards with an error rate below 3%. All deliverables should be reviewed for accuracy before submission.",
    },
    {
      category: "expectations",
      key: "pip_productivity_expectations",
      title: "Productivity Expectations",
      content:
        "Output levels must meet or exceed the departmental average. Deadlines must be met consistently, with advance notice provided for any potential delays.",
    },
    {
      category: "consequences",
      key: "pip_consequences",
      title: "PIP Consequences",
      content:
        "Failure to meet the performance expectations outlined in this plan may result in further disciplinary action, up to and including termination of employment.",
    },
  ],
};
