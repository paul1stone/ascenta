/**
 * Investigation Summary Workflow
 * Generates a structured workplace investigation summary
 */

import type { WorkflowDefinitionConfig } from "../types";
import { isEmpty, equals, isIn } from "../guardrails";

export const investigationSummaryWorkflow: WorkflowDefinitionConfig = {
  slug: "investigation-summary",
  name: "Investigation Summary",
  description:
    "Document workplace investigation findings with proper structure, evidence tracking, and compliance controls.",
  category: "investigation",
  audience: "hr_only",
  riskLevel: "high",
  estimatedMinutes: 30,
  icon: "Search",

  intakeFields: [
    // Case Information
    {
      fieldKey: "caseNumber",
      label: "Case/Reference Number",
      type: "text",
      placeholder: "Enter case tracking number",
      required: true,
      sortOrder: 1,
      groupName: "Case Information",
    },
    {
      fieldKey: "investigator",
      label: "Lead Investigator",
      type: "text",
      placeholder: "Enter investigator name",
      required: true,
      sortOrder: 2,
      groupName: "Case Information",
    },
    {
      fieldKey: "investigationStartDate",
      label: "Investigation Start Date",
      type: "date",
      required: true,
      sortOrder: 3,
      groupName: "Case Information",
    },
    {
      fieldKey: "investigationEndDate",
      label: "Investigation End Date",
      type: "date",
      required: true,
      sortOrder: 4,
      groupName: "Case Information",
    },

    // Parties Involved
    {
      fieldKey: "complainantName",
      label: "Complainant Name",
      type: "text",
      placeholder: "Enter complainant's name (or 'Anonymous' if applicable)",
      required: true,
      sortOrder: 5,
      groupName: "Parties Involved",
    },
    {
      fieldKey: "complainantDepartment",
      label: "Complainant Department",
      type: "text",
      required: false,
      sortOrder: 6,
      groupName: "Parties Involved",
    },
    {
      fieldKey: "respondentName",
      label: "Respondent Name",
      type: "text",
      placeholder: "Enter respondent's name",
      required: true,
      sortOrder: 7,
      groupName: "Parties Involved",
    },
    {
      fieldKey: "respondentDepartment",
      label: "Respondent Department",
      type: "text",
      required: false,
      sortOrder: 8,
      groupName: "Parties Involved",
    },
    {
      fieldKey: "respondentTitle",
      label: "Respondent Title",
      type: "text",
      required: false,
      sortOrder: 9,
      groupName: "Parties Involved",
    },

    // Allegation Details
    {
      fieldKey: "allegationType",
      label: "Allegation Type",
      type: "dropdown",
      required: true,
      sortOrder: 10,
      groupName: "Allegation",
      options: [
        { value: "harassment", label: "Harassment" },
        { value: "discrimination", label: "Discrimination" },
        { value: "retaliation", label: "Retaliation" },
        { value: "policy_violation", label: "Policy Violation" },
        { value: "misconduct", label: "Misconduct" },
        { value: "safety", label: "Safety Violation" },
        { value: "theft", label: "Theft/Fraud" },
        { value: "violence", label: "Workplace Violence/Threats" },
        { value: "substance", label: "Substance Abuse" },
        { value: "other", label: "Other" },
      ],
    },
    {
      fieldKey: "allegationDetails",
      label: "Allegation Summary",
      type: "textarea",
      placeholder: "Summarize the allegation(s) as reported",
      helpText:
        "Describe the allegation objectively as it was reported. Do not include conclusions at this stage.",
      required: true,
      sortOrder: 11,
      groupName: "Allegation",
      validationRules: {
        minLength: 50,
        maxLength: 3000,
      },
    },
    {
      fieldKey: "incidentDates",
      label: "Date(s) of Alleged Incident(s)",
      type: "textarea",
      placeholder: "List the date(s) when the alleged incident(s) occurred",
      required: true,
      sortOrder: 12,
      groupName: "Allegation",
    },

    // Investigation Process
    {
      fieldKey: "witnessesInterviewed",
      label: "Witnesses Interviewed",
      type: "textarea",
      placeholder:
        "List all witnesses interviewed (names and titles/roles). Include date of each interview.",
      helpText: "Format: Name, Title - Interview Date",
      required: true,
      sortOrder: 13,
      groupName: "Investigation Process",
    },
    {
      fieldKey: "evidenceCollected",
      label: "Evidence Collected",
      type: "checkbox_group",
      helpText: "Select all types of evidence collected",
      required: true,
      sortOrder: 14,
      groupName: "Investigation Process",
      options: [
        { value: "interview_notes", label: "Interview Notes/Transcripts" },
        { value: "emails", label: "Email Communications" },
        { value: "messages", label: "Text/Chat Messages" },
        { value: "documents", label: "Documents/Records" },
        { value: "video", label: "Video/CCTV Footage" },
        { value: "photos", label: "Photographs" },
        { value: "physical", label: "Physical Evidence" },
        { value: "policies", label: "Relevant Policies" },
        { value: "personnel_file", label: "Personnel File Records" },
        { value: "other", label: "Other Evidence" },
      ],
    },
    {
      fieldKey: "evidenceDetails",
      label: "Evidence Details",
      type: "textarea",
      placeholder: "Describe the evidence collected and its relevance to the allegations",
      required: true,
      sortOrder: 15,
      groupName: "Investigation Process",
    },

    // Findings
    {
      fieldKey: "findingsSummary",
      label: "Summary of Findings",
      type: "textarea",
      placeholder: "Summarize the key findings from the investigation",
      helpText:
        "Describe what the investigation revealed. Be factual and objective.",
      required: true,
      sortOrder: 16,
      groupName: "Findings",
      validationRules: {
        minLength: 100,
      },
    },
    {
      fieldKey: "credibilityAssessment",
      label: "Credibility Assessment",
      type: "textarea",
      placeholder:
        "Assess the credibility of statements made by complainant, respondent, and witnesses",
      helpText:
        "Consider consistency, corroboration, demeanor, motive, and plausibility",
      required: true,
      sortOrder: 17,
      groupName: "Findings",
    },
    {
      fieldKey: "substantiated",
      label: "Allegation Substantiated?",
      type: "dropdown",
      required: true,
      sortOrder: 18,
      groupName: "Findings",
      options: [
        { value: "substantiated", label: "Substantiated" },
        { value: "unsubstantiated", label: "Unsubstantiated" },
        { value: "inconclusive", label: "Inconclusive" },
        { value: "partially_substantiated", label: "Partially Substantiated" },
      ],
    },
    {
      fieldKey: "substantiationRationale",
      label: "Substantiation Rationale",
      type: "textarea",
      placeholder: "Explain the basis for the substantiation determination",
      required: true,
      sortOrder: 19,
      groupName: "Findings",
      validationRules: {
        minLength: 50,
      },
    },

    // Policy Analysis
    {
      fieldKey: "policiesViolated",
      label: "Policies Potentially Violated",
      type: "textarea",
      placeholder: "List specific policies that may have been violated",
      required: false,
      sortOrder: 20,
      groupName: "Policy Analysis",
    },

    // Recommendations
    {
      fieldKey: "recommendedAction",
      label: "Recommended Action",
      type: "checkbox_group",
      helpText: "Select recommended corrective actions",
      required: true,
      sortOrder: 21,
      groupName: "Recommendations",
      options: [
        { value: "no_action", label: "No Action Required" },
        { value: "coaching", label: "Coaching/Counseling" },
        { value: "training", label: "Additional Training" },
        { value: "verbal_warning", label: "Verbal Warning" },
        { value: "written_warning", label: "Written Warning" },
        { value: "final_warning", label: "Final Written Warning" },
        { value: "suspension", label: "Suspension" },
        { value: "demotion", label: "Demotion" },
        { value: "transfer", label: "Transfer/Reassignment" },
        { value: "termination", label: "Termination" },
        { value: "other", label: "Other Action" },
      ],
    },
    {
      fieldKey: "actionRationale",
      label: "Action Rationale",
      type: "textarea",
      placeholder: "Explain the basis for the recommended action",
      required: true,
      sortOrder: 22,
      groupName: "Recommendations",
    },
    {
      fieldKey: "preventiveMeasures",
      label: "Preventive Measures",
      type: "textarea",
      placeholder:
        "Describe any systemic or preventive measures recommended",
      required: false,
      sortOrder: 23,
      groupName: "Recommendations",
    },
  ],

  guardrails: [
    {
      id: "harassment-retaliation-lock",
      name: "Harassment/Retaliation Export Restriction",
      description: "Harassment and retaliation cases require HR-only export",
      triggerCondition: isIn("allegationType", ["harassment", "retaliation"]),
      severity: "escalation",
      message:
        "Harassment and retaliation investigations have restricted export. Only HR personnel may export this document.",
      requiredAction: "role_lock",
      escalateTo: "HR",
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "substantiated-no-action",
      name: "Substantiated Without Action",
      description: "Substantiated findings should typically include corrective action",
      triggerCondition: {
        field: "substantiated",
        operator: "equals",
        value: "substantiated",
        and: [
          {
            field: "recommendedAction",
            operator: "contains",
            value: "no_action",
          },
        ],
      },
      severity: "warning",
      message:
        "The allegation was substantiated but no corrective action is recommended. Please provide a rationale.",
      requiredAction: "rationale",
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "missing-evidence",
      name: "Missing Evidence Documentation",
      description: "Investigations must document evidence collected",
      triggerCondition: isEmpty("evidenceCollected"),
      severity: "hard_stop",
      message:
        "You must document the evidence collected during the investigation.",
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "no-witnesses",
      name: "No Witnesses Interviewed",
      description: "Investigations typically involve witness interviews",
      triggerCondition: isEmpty("witnessesInterviewed"),
      severity: "warning",
      message:
        "No witnesses were interviewed. If this is intentional, provide a rationale.",
      requiredAction: "rationale",
      sortOrder: 4,
      isActive: true,
    },
    {
      id: "termination-recommendation",
      name: "Termination Recommendation",
      description: "Termination recommendations require additional review",
      triggerCondition: {
        field: "recommendedAction",
        operator: "contains",
        value: "termination",
      },
      severity: "escalation",
      message:
        "Termination is recommended. Legal and senior HR review required before proceeding.",
      requiredAction: "hr_review",
      escalateTo: "Legal/HR",
      sortOrder: 5,
      isActive: true,
    },
    {
      id: "violence-immediate-action",
      name: "Violence/Threats Require Immediate Action",
      description: "Workplace violence cases may require immediate intervention",
      triggerCondition: equals("allegationType", "violence"),
      severity: "escalation",
      message:
        "Workplace violence/threat allegations require immediate safety assessment. Ensure appropriate safety measures are in place.",
      escalateTo: "Security/HR",
      sortOrder: 6,
      isActive: true,
    },
  ],

  artifactTemplates: [
    {
      id: "investigation-summary-memo",
      name: "Investigation Summary Memo",
      type: "memo",
      exportFormats: ["pdf", "docx"],
      sections: [
        {
          key: "header",
          title: "Document Header",
          locked: true,
          content: `CONFIDENTIAL - ATTORNEY-CLIENT PRIVILEGED
WORKPLACE INVESTIGATION SUMMARY

Case Number: {{caseNumber}}
Lead Investigator: {{investigator}}
Investigation Period: {{investigationStartDate}} to {{investigationEndDate}}

DISTRIBUTION: HR Leadership Only`,
        },
        {
          key: "parties",
          title: "Parties Involved",
          locked: true,
          content: `Complainant: {{complainantName}}
{{#if complainantDepartment}}Department: {{complainantDepartment}}{{/if}}

Respondent: {{respondentName}}
{{#if respondentTitle}}Title: {{respondentTitle}}{{/if}}
{{#if respondentDepartment}}Department: {{respondentDepartment}}{{/if}}`,
        },
        {
          key: "allegations",
          title: "Summary of Allegations",
          locked: false,
          aiPrompt: `Write a formal, objective summary of the allegations. Include:
- The nature of the allegation ({{allegationType}})
- When the alleged incident(s) occurred ({{incidentDates}})
- Key details as reported

Original allegation summary: {{allegationDetails}}

Write in a neutral, professional tone. Do not include conclusions or characterizations.`,
        },
        {
          key: "methodology",
          title: "Investigation Methodology",
          locked: false,
          aiPrompt: `Describe the investigation methodology used. Include:
- Witnesses interviewed: {{witnessesInterviewed}}
- Types of evidence collected: {{evidenceCollected}}
- Evidence details: {{evidenceDetails}}

Format as a professional summary of the investigation process.`,
        },
        {
          key: "findings",
          title: "Findings of Fact",
          locked: false,
          aiPrompt: `Write a professional summary of the investigation findings. Include:
- Key facts discovered during the investigation
- Credibility assessment summary
- Analysis of evidence

Findings summary: {{findingsSummary}}
Credibility assessment: {{credibilityAssessment}}

Present findings objectively without editorializing.`,
        },
        {
          key: "conclusion",
          title: "Conclusion",
          locked: false,
          aiPrompt: `Write a formal conclusion statement. Include:
- Whether the allegation was {{substantiated}}
- The basis for this determination: {{substantiationRationale}}
{{#if policiesViolated}}- Policies potentially violated: {{policiesViolated}}{{/if}}

Be clear and definitive in stating the conclusion.`,
        },
        {
          key: "recommendations",
          title: "Recommendations",
          locked: false,
          aiPrompt: `Write professional recommendations based on the investigation findings. Include:
- Recommended corrective action: {{recommendedAction}}
- Rationale: {{actionRationale}}
{{#if preventiveMeasures}}- Preventive measures: {{preventiveMeasures}}{{/if}}

Format as actionable recommendations with clear ownership.`,
        },
        {
          key: "confidentiality",
          title: "Confidentiality Notice",
          locked: true,
          content: `CONFIDENTIALITY NOTICE

This investigation summary contains confidential personnel information. Distribution is restricted to individuals with a legitimate business need to know. All recipients are reminded of their obligation to maintain confidentiality.

This document was prepared at the direction of legal counsel and is protected by attorney-client privilege and/or work product doctrine.

Prepared by: {{investigator}}
Date: {{investigationEndDate}}`,
        },
      ],
    },
  ],

  guidedActions: [
    {
      id: "summarize-allegations",
      label: "Write formal allegation summary",
      description: "Convert notes into professional allegation statement",
      icon: "FileText",
      requiredInputs: ["allegationDetails", "allegationType"],
      outputType: "rewrite",
      outputTarget: "allegations",
      promptTemplate: `Rewrite the following allegation description in formal, objective language suitable for an investigation report. Use neutral terminology and avoid characterizations.

Allegation type: {{allegationType}}
Original description: {{allegationDetails}}`,
      sortOrder: 1,
      isActive: true,
    },
    {
      id: "assess-credibility",
      label: "Draft credibility assessment",
      description: "Generate a structured credibility analysis",
      icon: "Scale",
      requiredInputs: ["findingsSummary", "witnessesInterviewed"],
      outputType: "artifact",
      outputTarget: "credibilityAssessment",
      promptTemplate: `Create a professional credibility assessment for this investigation. Consider:
- Consistency of statements
- Corroborating evidence
- Potential bias or motive
- Plausibility of accounts

Findings: {{findingsSummary}}
Witnesses interviewed: {{witnessesInterviewed}}

Provide a balanced assessment of the credibility of the complainant, respondent, and key witnesses.`,
      sortOrder: 2,
      isActive: true,
    },
    {
      id: "identify-gaps",
      label: "What information is missing?",
      description: "Identify gaps in the investigation",
      icon: "Search",
      requiredInputs: ["allegationDetails"],
      outputType: "analysis",
      promptTemplate: `Review the following investigation information and identify any gaps or additional steps that should be considered:

Allegation: {{allegationType}} - {{allegationDetails}}
Witnesses: {{witnessesInterviewed}}
Evidence: {{evidenceCollected}} - {{evidenceDetails}}
Findings: {{findingsSummary}}

List:
1. Additional witnesses who should be interviewed
2. Evidence that should be collected
3. Questions that remain unanswered
4. Any procedural steps that may have been missed`,
      sortOrder: 3,
      isActive: true,
    },
    {
      id: "recommend-action",
      label: "Suggest appropriate corrective action",
      description: "Recommend action based on findings",
      icon: "Gavel",
      requiredInputs: ["substantiated", "allegationType", "findingsSummary"],
      outputType: "analysis",
      promptTemplate: `Based on the investigation findings, recommend appropriate corrective action:

Allegation type: {{allegationType}}
Substantiation: {{substantiated}}
Findings: {{findingsSummary}}
{{#if policiesViolated}}Policies violated: {{policiesViolated}}{{/if}}

Consider:
- Severity of the conduct
- Prior discipline history (if any)
- Impact on the workplace
- Consistency with past practice
- Legal/compliance considerations

Provide a recommendation with rationale.`,
      sortOrder: 4,
      isActive: true,
    },
  ],

  textLibraryEntries: [
    {
      category: "policy_references",
      key: "harassment_policy",
      title: "Harassment Policy Reference",
      content:
        "This investigation was conducted pursuant to Company Policy [X.X] - Workplace Harassment Prevention, which prohibits harassment based on protected characteristics.",
    },
    {
      category: "policy_references",
      key: "investigation_standards",
      title: "Investigation Standards",
      content:
        "This investigation was conducted in accordance with Company investigation standards, which require prompt, thorough, and impartial investigation of all workplace complaints.",
    },
    {
      category: "acknowledgment",
      key: "confidentiality_standard",
      title: "Standard Confidentiality Language",
      content:
        "All parties interviewed were reminded of their obligation to maintain confidentiality regarding the investigation and were instructed not to discuss the matter or retaliate against anyone involved.",
    },
  ],
};
