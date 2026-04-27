# Canopy — HR Insights Dashboard

> HR Role · Organization-Wide View · All Six Areas of Work

## Overview

Canopy is the HR-exclusive Insights view within Ascenta. It provides a unified, organization-wide lens across all six areas of work: Protect, Plan, Attract, Launch, Grow, and Care. Canopy surfaces the metrics, trends, and risk signals that HR needs to lead proactively rather than reactively. Every Canopy view is read-only and analytics-driven. No actions are taken from Canopy directly. HR navigates to the relevant area of work to act on what Canopy reveals.

---

## Dashboard Architecture

### Access · Role and Visibility

- [ ] **HR/People Ops only** — Canopy is visible only to HR and People Ops roles. Managers do not have access.
- [ ] **Manager equivalent is Vantage (out of scope)** — Managers access a separate analytics layer called Vantage scoped to their direct team. Employees have no Insights view.
- [ ] **Org-wide aggregation** — HR users see aggregated, organization-wide data across all locations, departments, and managers.
- [ ] **Privacy threshold** — No individual employee-level data surfaced in Canopy without a threshold of at least five employees in the cohort.
- [ ] **Role-level access configuration** — HR Admins can configure which HR users have Canopy access. Set at the role level within Ascenta system settings.

### Structure · Three-Layer View Model

- [ ] **Layer 1 — Summary Dashboard** — Canopy home screen. One card per area of work. Each card shows: a health indicator (green/yellow/red), one headline metric, and the top open risk signal. Entry point for every Canopy session.
- [ ] **Layer 2 — Area Detail** — Clicking any area card opens the full detail view for that area. Shows all subcategories within that area with both Status and Insights panels expanded.
- [ ] **Layer 3 — Drill-Down** — Within any subcategory, HR can drill into a specific metric to see breakdown by location, department, manager, or time period. Drill-down views include an export option for reporting or audit.

### Filters · Global Filter Controls

- [ ] **Date Range** — Rolling 30 days (default), 90 days, 6 months, 12 months, or custom range.
- [ ] **Location** — All locations or a specific site. Useful for regional HR leads who manage multiple sites.
- [ ] **Department** — All departments or a specific function. Helps HR isolate patterns to a business unit.
- [ ] **Manager** — Filter by manager to isolate signals for a specific team. Available in drill-down view only.
- [ ] **Filter persistence** — All filters persist across the Canopy session and reset when the user closes Canopy.

### Signals · Health Indicator Logic

- [ ] **Green** — All key metrics within expected ranges. No overdue items. No active risk flags.
- [ ] **Yellow** — One or more metrics crossed a warning threshold or one overdue item exists. HR should review but no immediate action required.
- [ ] **Red** — Critical threshold crossed, compliance deadline at risk, or high-severity flag active. HR should act within 24 hours.
- [ ] **Recalculation cadence** — Health indicators recalculate every four hours.
- [ ] **Manual refresh** — HR can trigger a manual refresh from the Canopy summary screen.

---

## PROTECT

### Subcategory: Protected Feedback

> A safe way for employees to raise concerns and for the organization to route, respond, and document appropriately.

#### Status

- [ ] **Open items by category and severity** — safety, conduct, harassment, retaliation
- [ ] **Aging in days, SLA timers, and waiting-on indicators** — employee, manager, or HR
- [ ] **Completion rate for required steps** — acknowledgement, triage, and routing
- [ ] **Volume trend** — submissions this period versus prior period

#### Canopy Insights

- [ ] **Themes over time** — hotspots by location, leader, or department
- [ ] **Repeat concerns by topic** — signals systemic issues that one-off responses won't resolve
- [ ] **Cycle time and bottleneck drivers** — where submissions stall and for how long
- [ ] **Correlation indicators** — feedback volume versus engagement or turnover data where available

### Subcategory: Investigations

> Investigation planning, evidence tracking, interview guides, findings documentation, and closure packages.

#### Status

- [ ] **Cases by phase** — intake, plan, interviews, findings, and close
- [ ] **Timeline adherence** — overdue interviews and missing evidence flags
- [ ] **Risk flags** — retaliation risk, high severity, and legal hold status
- [ ] **Investigator workload distribution** — cases per assigned HR team member

#### Canopy Insights

- [ ] **Allegation type frequency and substantiation rate by category**
- [ ] **Time-to-close and key delay drivers by phase**
- [ ] **Prevention opportunities** — policy or training gaps indicated by finding patterns
- [ ] **Repeat allegation types by department or location** — rolling 12-month window

### Subcategory: Policy Governance and Acknowledgements

> Policy library, versioning, acknowledgement campaigns, reminders, and audit-ready completion reporting.

#### Status

- [ ] **Completion dashboard** — acknowledgement rate by group, location, and manager
- [ ] **Reminder effectiveness and overdue acknowledgement counts**
- [ ] **Audit-ready export and reporting view** — with timestamp and version logs
- [ ] **Policies pending update** — last review date and responsible owner

#### Canopy Insights

- [ ] **Completion friction** — which groups consistently lag and likely root causes
- [ ] **Policy comprehension signals** — FAQ topics and repeat questions by policy
- [ ] **Correlation indicators** — policy updates versus incident category trends
- [ ] **Campaign effectiveness** — open rate, completion rate, and average time to complete by delivery method

---

## PLAN

### Subcategory: Organization Design and Operating Model

> Define how work runs: roles, decision rights, accountability, and change workflows for organization updates.

#### Status

- [ ] **Pending org changes and approval stages** — with aging indicators
- [ ] **Open action items from org change checklists by owner**
- [ ] **Role clarity completion** — which roles have charters and RACI documents completed
- [ ] **Headcount plan versus actual by department**

#### Canopy Insights

- [ ] **Bottlenecks in decision rights and meeting load by function**
- [ ] **Span of control patterns** — managers with fewer than three or more than ten direct reports
- [ ] **Change volume versus performance and turnover indicators for context**
- [ ] **Role clarity gaps** — roles without completed charters as a leading indicator of confusion and conflict

### Subcategory: HR Operations

> Workflow automation powered by Ascenta to reduce manual effort and accelerate execution for repeatable HR processes.

#### Status

- [ ] **Active workflow runs** — count and status (running, stalled, completed, failed)
- [ ] **SLA adherence by workflow type**
- [ ] **Workflows with at least one overdue step flagged by owner**
- [ ] **HR team workload distribution** — open tasks per HR team member

#### Canopy Insights

- [ ] **Workflow efficiency trends** — average completion time this period versus prior periods
- [ ] **Most common manual overrides** — where automation is bypassed and why
- [ ] **Error and failure rate by workflow type** — signals that a workflow needs redesign
- [ ] **ROI indicators** — estimated time saved through automation versus prior manual baseline

---

## ATTRACT

### Subcategory: Talent Outreach

> Job requisition lifecycle from draft through approved, open, interviewing, and offer.

#### Status

- [ ] **Job requisitions by stage** — draft, approved, open, interviewing, and offer
- [ ] **Approval aging and stuck requisitions** — with owner and days waiting
- [ ] **Time-to-fill snapshot by role type and department**
- [ ] **Open requisition count versus hiring plan target**

#### Canopy Insights

- [ ] **Where requisitions stall** — approval, sourcing, or interview loops
- [ ] **Role demand hotspots** — functions consistently over plan
- [ ] **Drivers of offer declines** — coded reason frequency by role and location
- [ ] **Source effectiveness** — which channels produce the most completed hires

### Subcategory: Interview Kits and Scorecards

> Structured interview guides and candidate evaluation scorecards that feed the hiring decision and lead to an offer letter.

#### Status

- [ ] **Scorecard completion rate by interviewer and by role**
- [ ] **Interview stage throughput** — candidates advancing versus declining at each stage
- [ ] **Quality flags** — missing rationale, incomplete scoring, and inconsistent assessments
- [ ] **Time-in-stage averages by interview round**

#### Canopy Insights

- [ ] **Interviewer calibration variance** — which interviewers score significantly above or below peers on the same candidate
- [ ] **Stage drop-off patterns** — where the strongest candidates disengage
- [ ] **Structured interview adherence rate** — percentage of interviews using a kit versus unstructured
- [ ] **Predictors of successful hires** — based on scorecard factors and post-hire outcomes

### Subcategory: Hiring Decision and Offer Readiness

> Candidate evaluation summary, selection decisions, and pre-offer preparation.

#### Status

- [ ] **Decisions pending with aging and completeness checklist**
- [ ] **Offer-ready rate** — percentage of selections with all required documentation complete
- [ ] **Pre-hire readiness dashboard by candidate**
- [ ] **Background check completion and blockers**

#### Canopy Insights

- [ ] **Decision cycle time drivers** — where the process slows after a final interview
- [ ] **Patterns in rejected candidates** — recurring skill gap themes by role
- [ ] **Offer acceptance rate by role, location, and compensation band**
- [ ] **Start-date risk flags and dropout points between offer and day one**

---

## LAUNCH

### Subcategory: Arrival Orchestration

> An Ascenta-powered workflow that streamlines and tracks every milestone from offer letter through day-one readiness. Task completion, owner accountability, deadlines, and escalation across all pre-boarding and onboarding activities are monitored so nothing falls through the cracks.

#### Status

- [ ] **Readiness score by new hire** — green, yellow, and red status
- [ ] **Task completion by owner** — IT, manager, HR, and operations
- [ ] **Blockers list and overdue items with escalation flags**
- [ ] **Day-one readiness rate** — percentage of new hires fully ready by their start date

#### Canopy Insights

- [ ] **Onboarding delay drivers** — which task categories and owner types most commonly miss deadlines
- [ ] **Teams and locations with repeat day-one failures** — rolling 90-day window
- [ ] **Time-to-productivity signals** — early performance indicators correlated to onboarding completion
- [ ] **Manager onboarding adherence rate** — managers who consistently complete pre-boarding tasks versus those who do not

---

## GROW

### Subcategory: Performance System

> Goals, check-ins, review cycles, and documentation capture so performance is consistent and defensible.

#### Status

- [ ] **Check-in completion rates by manager, department, and location**
- [ ] **Review cycle progress tracker** — employees at each phase
- [ ] **Late and missing documentation flags** — with owner and days overdue
- [ ] **Goal alignment rate** — percentage of employee goals linked to a Strategy Studio pillar

#### Canopy Insights

- [ ] **Performance distribution trends** — high level: how ratings cluster across the organization
- [ ] **Teams with low check-in adherence** — leading indicator of disengagement or manager avoidance
- [ ] **Drivers of performance issues** — coded reasons from corrective action and check-in notes
- [ ] **Goal balance ratio** — performance goals versus development goals by team and manager

### Subcategory: Coaching and Corrective Action

> Coaching notes, performance improvement plans, corrective action documentation, follow-up cadence, and approvals.

#### Status

- [ ] **Active coaching plans and PIPs by stage** — initiated, in progress, and resolution
- [ ] **Follow-up adherence** — missed or overdue check-ins on active plans
- [ ] **Approval queue and overdue corrective action approvals**
- [ ] **Time in stage for each active PIP**

#### Canopy Insights

- [ ] **Repeat issues by type and team** — signals that a systemic problem exists
- [ ] **PIP success rate and average time-to-resolution by issue type and manager**
- [ ] **Leading indicators** — missed follow-ups as an early signal of plan failure
- [ ] **Manager patterns** — which managers initiate corrective action and which avoid it

---

## CARE

### Subcategory: Benefits Hub

> A single front door for benefits enrollment, education, accommodations, disability, ADA, and PWFA guidance. Helps employees take action and helps HR complete forms and receive compliance guidance. A comprehensive resource for every benefits need from enrollment through life events.

#### Status

- [ ] **Open benefits cases by type** — enrollment, accommodation, ADA, PWFA, and life event
- [ ] **Aging and waiting-on-employee-documentation flags by case**
- [ ] **Completion dashboard for required notices and process steps**
- [ ] **Open accommodation requests and approval stage by case**

#### Canopy Insights

- [ ] **Top benefits friction points** — which case types take longest and where employees disengage
- [ ] **Time-to-resolution by case type over rolling periods**
- [ ] **Repeated questions** — signal of content gaps in benefits education materials
- [ ] **Accommodation request patterns** — type, department, and resolution rate

---

## Canopy Cross-Area Summary View

### SUMMARY-1 · Organization Health Score

- [ ] **Aggregate score 1–100** — Canopy computes an Organization Health Score by aggregating signal inputs from all six areas. Displayed as an index from 1 to 100 on the Canopy home screen.
- [ ] **Not a performance rating** — It is a composite risk and activity signal designed to prompt HR attention to the right area at the right time.
- [ ] **Score components** — Compliance adherence (Protect and Care signals), Talent velocity (Attract and Launch signals), Performance system health (Grow signals), and Operational stability (Plan signals).
- [ ] **Component weighting** — Each component is weighted equally in the base configuration. HR Admins may adjust component weights in Canopy settings.

### SUMMARY-2 · Canopy Digest

- [ ] **Weekly digest delivery** — A weekly summary delivered to HR users via Ascenta notification.
- [ ] **Digest content** — Current Organization Health Score and direction of change from prior week, the top three open risk signals across all areas, any items moved from yellow to red since the last digest, and one strategic signal selected by the system based on the biggest change in any trend metric.
- [ ] **User configuration** — HR users may configure Digest frequency (weekly or daily) and preferred delivery method (in-platform notification or email summary) in their Canopy preferences.

### SUMMARY-3 · Export and Reporting

- [ ] **Export from every view** — Every Canopy view supports a data export for audit, reporting, or board-level summaries.
- [ ] **Export formats** — CSV for raw data and a formatted PDF summary for stakeholder reporting.
- [ ] **Export logging** — Exports logged with the HR user name, timestamp, and filter configuration applied at the time of export.
- [ ] **Export log access** — Export logs accessible to HR Admins under Canopy Settings.
- [ ] **PII protection in exports** — No personally identifiable employee data is included in any export unless the HR user has explicit Data Access authorization in their Ascenta role configuration.

---

## Metric Specifications · Phase 4 Build Reference

The following specifications define eleven real Canopy metrics. Each card shows an example value drawn from the Brandon White MVP scenario, the data source and tables Ascenta reads to produce the metric, the calculation logic, the event or schedule that triggers a refresh, and the green, yellow, and red threshold rules that drive the health indicator.

### GROW — Performance System

#### Metric: Check-in completion rate

- [ ] **Example value** — 71% · 3 managers below 80% threshold — Katie Smith at 50%
- [ ] **Data source** — `check_ins` table; fields: `status`, `scheduled_date`, `completed_date`, `employee_id`, `manager_id`
- [ ] **Calculation** — Completed check-ins ÷ scheduled check-ins within the selected date range; grouped by `manager_id`; org-wide average shown on summary tile; drill-down shows per-manager breakdown with names
- [ ] **Trigger** — Check-in status set to complete by manager or employee; overdue flag fires automatically when `scheduled_date` passes without completion; task engine marks overdue daily at midnight
- [ ] **Refresh** — Every 4 hours for the summary tile; real-time on status change in the drill-down view
- [ ] **Threshold logic** — Green: all managers ≥ 80% · Yellow: one or more managers at 60–79% · Red: any manager below 60% or org average below 65%

#### Metric: Coaching case volume by stage

- [ ] **Example value** — 9 active · 5 verbal coaching · 2 written warning · 2 PIP · 1 follow-up overdue
- [ ] **Data source** — `corrective_action_cases` table; fields: `stage` (verbal, written, PIP), `status` (open, resolved), `employee_id`, `manager_id`, `opened_at`, `follow_up_date`
- [ ] **Calculation** — Count of cases where `status = open`; grouped by `stage`; cross-referenced against `follow_up_tasks` table to flag overdue follow-ups; HR concurrence log joined for approval status
- [ ] **Trigger** — Case opened by manager in Coaching and Corrective Action module; HR concurrence event fires a Canopy notification to HR role immediately; stage escalation updates tile in real time
- [ ] **Refresh** — Real-time on any case state change; approval queue badge updates on every HR concurrence action
- [ ] **Threshold logic** — Green: 0–3 open cases with no overdue follow-ups · Yellow: 4–7 open cases or one overdue follow-up · Red: 8+ open cases · or any overdue PIP follow-up · or any case without HR concurrence beyond 48 hours

#### Metric: PIP success rate (rolling 12 months)

- [ ] **Example value** — 67% · 4 of 6 PIPs resolved without separation — trending up from 50% at period start
- [ ] **Data source** — `corrective_action_cases` where `stage = PIP`; fields: `resolution` (improved, separated, in_progress), `closed_at`, `manager_id`, `employee_id`
- [ ] **Calculation** — Count where `resolution = improved` ÷ count of all cases where resolution is not `in_progress`; rolling 12-month window; in-progress PIPs excluded from both numerator and denominator until closed
- [ ] **Trigger** — PIP closure event with resolution type selected by HR or manager; trend line recalculates monthly on the 1st of each month; Canopy surfaces a digest alert if rate drops more than 10 points in a single period
- [ ] **Refresh** — On every PIP closure event; trend line monthly; Canopy digest weekly
- [ ] **Threshold logic** — Green: success rate ≥ 65% · Yellow: 45–64% · Red: below 45% · or 3+ PIPs open simultaneously without a progress update in 14 days

#### Metric: Culture Gym streak distribution

- [ ] **Example value** — 58% active · median streak 14 days · 23 employees at 30+ days · Brandon White at 107 days
- [ ] **Data source** — `culture_gym_sessions` table; fields: `employee_id`, `session_date`, `response`, `skill_category`; joined to `employees` for department and manager grouping
- [ ] **Calculation** — Consecutive daily session count per employee by ordering sessions by `session_date` and detecting gaps; bucketed: inactive (0 days), 1–7 days, 8–29 days, 30+ days; active = at least one session within the last 7 days
- [ ] **Trigger** — Daily workout response logged by employee; streak counter increments or resets at midnight per employee timezone; 14-day threshold triggers skill pattern calculation in the corrective action module
- [ ] **Refresh** — Nightly recalculation for all streak buckets; Canopy shows last-updated timestamp on the tile
- [ ] **Threshold logic** — Green: ≥ 60% active · Yellow: 40–59% active · Red: below 40% active · or engagement drops more than 15 points in a single week

#### Metric: Goal progress rollup

- [ ] **Example value** — 61% on track · 18% at risk · 8% stalled · 13% complete · 11 goals with no update in 21+ days
- [ ] **Data source** — `goals` table; fields: `status` (on_track, at_risk, stalled, complete), `last_updated`, `employee_id`, `manager_id`, `strategy_pillar_id`; joined to `check_ins` for last discussion date
- [ ] **Calculation** — Count of goals per status bucket ÷ total active goals; stalled status set automatically by task engine when `last_updated` exceeds 21 days with no associated check-in discussion; goal alignment sub-metric: goals with a `strategy_pillar_id` ÷ total goals
- [ ] **Trigger** — Status updated by employee or manager in the Goals workspace; stalled flag set automatically by task engine on day 22 of no update; alignment rate recalculates when a goal is saved or modified
- [ ] **Refresh** — Every 4 hours for status distribution; stalled recalculation runs nightly; real-time on any goal save event in drill-down
- [ ] **Threshold logic** — Green: ≥ 70% on track with < 5% stalled · Yellow: 50–69% on track or 5–10% stalled · Red: below 50% on track · or > 10% stalled · or goal alignment rate below 60%

### ATTRACT + LAUNCH — Arrival Orchestration

#### Metric: Day-one readiness average

- [ ] **Example value** — 84% · 4 new hires active this quarter · 1 below 70% threshold · IT provisioning is the top blocker
- [ ] **Data source** — `onboarding_tasks` table; fields: `task_id`, `owner_type` (IT, facilities, HR, manager, new_hire), `status`, `due_date`, `completed_at`; joined to `launch_cases` by `launch_case_id`
- [ ] **Calculation** — Completed tasks ÷ total tasks per new hire at evaluation time; each task weighted equally; org average shown on summary tile; drill-down shows individual new-hire scores with task-level breakdown by owner type
- [ ] **Trigger** — Task marked complete by task owner in Arrival Orchestration; n8n workflow fires task creation simultaneously across all owner types when offer signature event is received
- [ ] **Refresh** — Real-time on every task completion; summary tile refreshes every 4 hours; score shown at new hire start date is the official Day One Readiness record
- [ ] **Threshold logic** — Green: average ≥ 85% · Yellow: 70–84% · Red: any individual new hire below 70% on their start date · or average below 70%

#### Metric: Arrival Orchestration cycle time

- [ ] **Example value** — 18 days · target is 14 days · IT provisioning accounts for 6 of 18 days — the single largest delay driver
- [ ] **Data source** — `onboarding_tasks`: `owner_type`, `created_at`, `completed_at`, `due_date`; `launch_cases`: `offer_signed_at`, `new_hire_start_date`
- [ ] **Calculation** — Days from `offer_signed_at` to `new_hire_start_date` per launch case; broken into owner-type sub-cycles by longest incomplete task duration per owner; average across all launch cases closed in selected date range
- [ ] **Trigger** — Offer signature event in ATTRACT starts the clock; n8n audit trail records a timestamp on every task creation and completion; cycle closes when new hire start date is reached and readiness score is recorded
- [ ] **Refresh** — Recalculates on every task completion for in-progress cases; rolling average across closed cases updates weekly
- [ ] **Threshold logic** — Green: ≤ 14 days · Yellow: 15–21 days · Red: > 21 days · or any single owner-type sub-cycle exceeding 10 days

#### Metric: Overdue task volume by owner type

- [ ] **Example value** — 7 overdue · IT accounts for 4 of 7 overdue tasks — 57% of all delays · no HR tasks overdue
- [ ] **Data source** — `onboarding_tasks` table; fields: `due_date`, `status`, `owner_type`, `launch_case_id`; joined to `employees` for new-hire context
- [ ] **Calculation** — Count of tasks where `due_date < today` and `status != complete`; grouped by `owner_type`; escalation flag set at 48 hours overdue; Day One blocking flag set for any task overdue with a new hire start date within 5 days
- [ ] **Trigger** — Task engine checks due dates every hour; overdue flag set automatically; Canopy badge and area health indicator update immediately; HR receives an escalation notification at 48 hours overdue
- [ ] **Refresh** — Hourly; Canopy displays last-check timestamp on the tile; Day One blocking flags trigger real-time alerts
- [ ] **Threshold logic** — Green: zero overdue tasks · Yellow: 1–3 overdue with no Day One blocking risk · Red: 4+ overdue · or any task with a Day One blocking flag · or any task overdue more than 5 days

### PROTECT — Feedback and Policy

#### Metric: Protected Feedback open items

- [ ] **Example value** — 5 open · 1 approaching 14-day SLA · 2 triaged · severity: 1 high, 3 medium, 1 low
- [ ] **Data source** — `protected_feedback` table; fields: `status` (submitted, acknowledged, triaged, routed, resolved), `submitted_at`, `severity` (high, medium, low), `category`, `assigned_to`
- [ ] **Calculation** — Count of submissions where `status != resolved`; SLA timer = today − `submitted_at` compared against configured SLA days per severity: high 7 days, medium 14 days, low 21 days; SLA warning fires at 75% of window elapsed
- [ ] **Trigger** — Submission received from employee or manager; status change logged with timestamp and HR user identity in audit trail; SLA warning fires automatically at 75% elapsed and again at 90% elapsed
- [ ] **Refresh** — Real-time on status change; SLA timers recalculate hourly; severity distribution recalculates on each new submission
- [ ] **Threshold logic** — Green: all submissions within SLA with no high-severity items open more than 3 days · Yellow: one item at 75% of SLA window or one high-severity open more than 5 days · Red: any SLA breach · any high-severity item open more than 7 days · or any item with a retaliation risk flag unreviewed

#### Metric: Policy acknowledgement completion

- [ ] **Example value** — 88% · 17 employees overdue · Sales department at 71% — lowest by function · 3 managers below 70%
- [ ] **Data source** — `policy_acknowledgements` table; fields: `policy_id`, `employee_id`, `acknowledged_at`, `campaign_id`; joined to `policies` for version and deadline; joined to `employees` for department and manager grouping
- [ ] **Calculation** — Employees who acknowledged ÷ total employees required to acknowledge per campaign; grouped by department, manager, and location; campaign deadline tracked per `policy_id`; audit-ready export includes version number and acknowledgement timestamp per employee
- [ ] **Trigger** — Employee clicks acknowledge in the Policy Governance workspace; timestamp and policy version number logged to the audit record; automated reminders fire at day 5 and day 10 of overdue status
- [ ] **Refresh** — Real-time on acknowledgement event; campaign completion rate recalculates every 4 hours; audit export reflects state at time of export
- [ ] **Threshold logic** — Green: ≥ 95% across all active campaigns · Yellow: 80–94% acknowledged or one department below 75% · Red: below 80% overall · or any audit deadline within 14 days with completion below 90% · or any required compliance policy at zero completions

### CARE — Benefits Hub

#### Metric: Open benefits cases by type

- [ ] **Example value** — 8 open · 2 accommodation requests · 1 ADA case · average age 6 days · 3 cases waiting on employee documentation
- [ ] **Data source** — `benefits_cases` table; fields: `case_type` (enrollment, accommodation, life_event, ADA, PWFA), `status`, `opened_at`, `waiting_on` (employee, HR, vendor), `assigned_hr_id`
- [ ] **Calculation** — Count of open cases grouped by `case_type`; case age = today − `opened_at`; `waiting_on` flag set manually by HR when employee documentation is pending; ADA and PWFA cases automatically surfaced in Canopy on submission regardless of volume
- [ ] **Trigger** — Case opened by employee in the Benefits Hub or created by HR on behalf of employee; ADA and PWFA case types fire an immediate Canopy notification to HR role upon submission; status change and `waiting_on` updates logged in audit trail
- [ ] **Refresh** — Real-time on case open and status change; aging recalculates daily at midnight; Canopy digest includes any case open more than 10 days
- [ ] **Threshold logic** — Green: zero ADA or PWFA cases unreviewed with all cases below 10 days · Yellow: any case older than 10 days or two or more accommodation requests open simultaneously · Red: any ADA or PWFA case unreviewed for more than 3 days · or any case with a legal hold flag · or more than 5 cases open across all types simultaneously

---

## Scope Notes

- **Canopy is HR-exclusive.** Managers access Vantage for team-scoped analytics. Employees do not have access to an Insights view.
- **Read-only.** No actions taken from Canopy directly — HR navigates to the relevant area of work to act.
