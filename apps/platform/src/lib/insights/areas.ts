import type { AreaDef } from "./types";

export const INSIGHTS_AREAS: AreaDef[] = [
  {
    key: "protect",
    label: "Protect",
    subtitle: "Feedback, Investigations & Policy",
    color: "#8888aa",
    subcategories: [
      {
        key: "protected-feedback",
        label: "Protected Feedback",
        description:
          "A safe way for employees to raise concerns and for the organization to route, respond, and document appropriately.",
        statusItems: [
          "Open items by category and severity (safety, conduct, harassment, retaliation)",
          "Aging in days, SLA timers, and waiting-on indicators",
          "Completion rate for required acknowledgement, triage, and routing steps",
          "Volume trend: submissions this period versus prior period",
        ],
        insightItems: [
          "Themes over time: hotspots by location, leader, or department",
          "Repeat concerns by topic — signals systemic issues",
          "Cycle time and bottleneck drivers",
          "Correlation indicators: feedback volume vs engagement or turnover",
        ],
        metricIds: ["protected-feedback-open"],
      },
      {
        key: "investigations",
        label: "Investigations",
        description:
          "Investigation planning, evidence tracking, interview guides, findings documentation, and closure packages.",
        statusItems: [
          "Cases by phase: intake, plan, interviews, findings, close",
          "Timeline adherence, overdue interviews, missing evidence flags",
          "Risk flags: retaliation risk, high severity, legal hold",
          "Investigator workload distribution",
        ],
        insightItems: [
          "Allegation type frequency and substantiation rate",
          "Time-to-close and key delay drivers by phase",
          "Prevention opportunities from finding patterns",
          "Repeat allegation types by department over rolling 12-month window",
        ],
        metricIds: [],
      },
      {
        key: "policy-governance",
        label: "Policy Governance & Acknowledgements",
        description:
          "Policy library, versioning, acknowledgement campaigns, reminders, and audit-ready completion reporting.",
        statusItems: [
          "Completion dashboard by group, location, and manager",
          "Reminder effectiveness and overdue acknowledgement counts",
          "Audit-ready export with timestamp and version logs",
          "Policies pending update and owner",
        ],
        insightItems: [
          "Completion friction by group and likely root causes",
          "Policy comprehension signals: FAQ topics and repeat questions",
          "Policy updates vs incident category trends",
          "Campaign effectiveness by delivery method",
        ],
        metricIds: ["policy-ack-completion"],
      },
    ],
  },
  {
    key: "plan",
    label: "Plan",
    subtitle: "Org Design & HR Operations",
    color: "#6688bb",
    subcategories: [
      {
        key: "org-design",
        label: "Organization Design & Operating Model",
        description:
          "Define how work runs: roles, decision rights, accountability, and change workflows for organization updates.",
        statusItems: [
          "Pending org changes and approval stages with aging",
          "Open action items from org change checklists by owner",
          "Role clarity completion: charters and RACI documents",
          "Headcount plan vs actual by department",
        ],
        insightItems: [
          "Bottlenecks in decision rights and meeting load by function",
          "Span of control patterns: <3 or >10 direct reports",
          "Change volume vs performance and turnover indicators",
          "Role clarity gaps as a leading indicator of conflict",
        ],
        metricIds: [],
      },
      {
        key: "hr-operations",
        label: "HR Operations",
        description:
          "Workflow automation powered by Ascenta to reduce manual effort and accelerate execution for repeatable HR processes.",
        statusItems: [
          "Active workflow runs: count and status (running, stalled, completed, failed)",
          "SLA adherence by workflow type",
          "Workflows with at least one overdue step flagged by owner",
          "HR team workload distribution: open tasks per HR team member",
        ],
        insightItems: [
          "Workflow efficiency trends: completion time vs prior periods",
          "Most common manual overrides: where automation is bypassed",
          "Error and failure rate by workflow type",
          "ROI indicators: estimated time saved through automation",
        ],
        metricIds: [],
      },
    ],
  },
  {
    key: "attract",
    label: "Attract",
    subtitle: "Hiring Pipeline",
    color: "#aa8866",
    subcategories: [
      {
        key: "talent-outreach",
        label: "Talent Outreach",
        description:
          "Job requisition lifecycle from draft through approved, open, interviewing, and offer.",
        statusItems: [
          "Job requisitions by stage: draft, approved, open, interviewing, offer",
          "Approval aging and stuck requisitions",
          "Time-to-fill snapshot by role type and department",
          "Open requisition count vs hiring plan target",
        ],
        insightItems: [
          "Where requisitions stall: approval, sourcing, or interview loops",
          "Role demand hotspots: functions consistently over plan",
          "Drivers of offer declines by role and location",
          "Source effectiveness: which channels produce completed hires",
        ],
        metricIds: [],
      },
      {
        key: "interview-kits",
        label: "Interview Kits & Scorecards",
        description:
          "Structured interview guides and candidate evaluation scorecards that feed the hiring decision.",
        statusItems: [
          "Scorecard completion rate by interviewer and by role",
          "Interview stage throughput",
          "Quality flags: missing rationale, incomplete scoring",
          "Time-in-stage averages by interview round",
        ],
        insightItems: [
          "Interviewer calibration variance",
          "Stage drop-off patterns: where strongest candidates disengage",
          "Structured interview adherence rate",
          "Predictors of successful hires from scorecard factors",
        ],
        metricIds: [],
      },
      {
        key: "hiring-decision",
        label: "Hiring Decision & Offer Readiness",
        description:
          "Candidate evaluation summary, selection decisions, and pre-offer preparation.",
        statusItems: [
          "Decisions pending with aging and completeness checklist",
          "Offer-ready rate: percentage with all docs complete",
          "Pre-hire readiness dashboard by candidate",
          "Background check completion and blockers",
        ],
        insightItems: [
          "Decision cycle time drivers post final interview",
          "Patterns in rejected candidates by skill gap",
          "Offer acceptance rate by role, location, comp band",
          "Start-date risk flags between offer and day one",
        ],
        metricIds: [],
      },
    ],
  },
  {
    key: "launch",
    label: "Launch",
    subtitle: "Onboarding & Day-One Readiness",
    color: "#bb6688",
    subcategories: [
      {
        key: "arrival-orchestration",
        label: "Arrival Orchestration",
        description:
          "An Ascenta-powered workflow that streamlines and tracks every milestone from offer letter through day-one readiness.",
        statusItems: [
          "Readiness score by new hire: green, yellow, red status",
          "Task completion by owner: IT, manager, HR, operations",
          "Blockers list and overdue items with escalation flags",
          "Day-one readiness rate: percentage fully ready by start date",
        ],
        insightItems: [
          "Onboarding delay drivers by task category and owner",
          "Teams and locations with repeat day-one failures",
          "Time-to-productivity signals correlated to onboarding completion",
          "Manager onboarding adherence rate",
        ],
        metricIds: ["day-one-readiness", "arrival-cycle-time", "overdue-tasks-by-owner"],
      },
    ],
  },
  {
    key: "grow",
    label: "Grow",
    subtitle: "Performance & Development",
    color: "#44aa99",
    subcategories: [
      {
        key: "performance-system",
        label: "Performance System",
        description:
          "Goals, check-ins, review cycles, and documentation capture so performance is consistent and defensible.",
        statusItems: [
          "Check-in completion rates by manager, department, location",
          "Review cycle progress tracker: employees at each phase",
          "Late and missing documentation flags",
          "Goal alignment rate: goals linked to a Strategy Studio pillar",
        ],
        insightItems: [
          "Performance distribution trends across the organization",
          "Teams with low check-in adherence (leading indicator of disengagement)",
          "Drivers of performance issues from corrective action and check-in notes",
          "Goal balance ratio: performance vs development goals",
        ],
        metricIds: [
          "check-in-completion-rate",
          "goal-progress-rollup",
          "culture-gym-streaks",
        ],
      },
      {
        key: "coaching",
        label: "Coaching & Corrective Action",
        description:
          "Coaching notes, performance improvement plans, corrective action documentation, follow-up cadence, and approvals.",
        statusItems: [
          "Active coaching plans and PIPs by stage",
          "Follow-up adherence: missed or overdue check-ins",
          "Approval queue and overdue corrective action approvals",
          "Time in stage for each active PIP",
        ],
        insightItems: [
          "Repeat issues by type and team: signals systemic problems",
          "PIP success rate and time-to-resolution by manager",
          "Leading indicators: missed follow-ups as early signal of failure",
          "Manager patterns: who initiates corrective action and who avoids it",
        ],
        metricIds: ["coaching-case-volume", "pip-success-rate"],
      },
    ],
  },
  {
    key: "care",
    label: "Care",
    subtitle: "Benefits & Total Rewards",
    color: "#cc6677",
    subcategories: [
      {
        key: "benefits-hub",
        label: "Benefits Hub",
        description:
          "A single front door for benefits enrollment, education, accommodations, disability, ADA, and PWFA guidance.",
        statusItems: [
          "Open benefits cases by type: enrollment, accommodation, ADA, PWFA, life event",
          "Aging and waiting-on-employee-documentation flags",
          "Completion dashboard for required notices and process steps",
          "Open accommodation requests and approval stage",
        ],
        insightItems: [
          "Top benefits friction points by case type",
          "Time-to-resolution by case type over rolling periods",
          "Repeated questions as a signal of content gaps",
          "Accommodation request patterns by department and resolution rate",
        ],
        metricIds: ["benefits-cases-open"],
      },
    ],
  },
];

export function getArea(key: string): AreaDef | undefined {
  return INSIGHTS_AREAS.find((a) => a.key === key);
}

export function getSubcategory(areaKey: string, subKey: string) {
  const area = getArea(areaKey);
  if (!area) return undefined;
  return area.subcategories.find((s) => s.key === subKey);
}
