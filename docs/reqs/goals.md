# Goals

> Grow Module | Performance System | Goals
> Employee View | Manager View | HR and People Ops View

## Overview

Ascenta builds goals on a three-layer cascade connecting organizational strategy to individual accountability: Organizational Goals (from Strategy Studio, read-only), Team Goals (manager-translated, linked to org outcomes), and Individual Goals (co-created by manager and employee).

---

## What Every Goal Must Contain

### Required Fields

- [x] **Objective Statement** — one sentence naming the outcome and why it matters; minimum 15 words; must read as an outcome, not an activity; flag verb-only openings and prompt for a "so that" connection
- [!] **Strategy Pillar Link** — dropdown populated from Strategy Studio; every goal must link to at least one pillar before saving; goals without a pillar link cannot be marked as agreed — **PARTIAL: schema has strategyGoalId and AI flow links pillars, but direct create form shows static "Independent goal" text instead of a dropdown (#28)**
- [!] **Key Results (2-4)** — each validated against SMART criteria (Specific, Measurable, Achievable, Relevant, Time-bound); flag vague language, missing metrics, and absent deadlines; override possible but requires conscious confirmation — **PARTIAL: form enforces 2-4 key results with description/target/deadline, but no hard SMART validation — only soft heuristic via getObjectiveWarning() (#28)**
- [x] **Goal Type** — toggle: Performance Goal or Development Goal; soft warning if no development goal is present

### Optional Fields

- [x] **Support Agreement** — free text by manager naming specific commitments (resources, access, introductions, protected time, coaching, tools); visible to both parties; surfaced in manager pre-check-in prompts as a standing reminder
- [x] **Check-in Frequency** — dropdown: every check-in, monthly, or quarterly; default is every check-in; quarterly goals still surface when a key result deadline is approaching

## Goal Best Practices (System-Enforced)

- [!] Recommend 3-5 goals per review period, with 7 as upper limit and 3 as minimum — **PARTIAL: banner warns about development goal imbalance but no hard 3-5 limit enforcement (#28)**
- [x] Every employee should have at least one performance goal and one development goal; Ascenta flags imbalance automatically
- [ ] Goals should sit at stretch-but-achievable level (~70-80% confidence of achievement) — **NOT IMPLEMENTED (#28)**
- [!] Support five goal categories: Performance (results/output), Development (skill-building), Behavioral (competency/conduct), Project (task/milestone), Organizational (company-wide contribution) — **PARTIAL: only Performance and Development exist as goal types (#28)**
- [ ] For goals spanning a full year, include quarterly checkpoints; auto-trigger mid-period review at the halfway point — **NOT IMPLEMENTED (#28)**
- [x] Language guidance: start with strong action verb; flag weak verbs (try, help, support, participate); write outcomes not activities
- [!] Goals must be co-created between manager and employee; manager-created goals without employee input are flagged — **PARTIAL: AI flow supports co-creation but no explicit enforcement or flagging of manager-only goals (#28)**
- [x] Goals are embedded into check-ins, reflections, reviews, analytics, coaching, and development — not set and filed
- [ ] Longer-range goals include milestones and are revisited at midpoint — **NOT IMPLEMENTED (#28)**

## Shared Goal Lifecycle

- [ ] **Preparation** — strategy context, recommendations, aspirations, constraints, and prior goal history loaded before the conversation (Employee + Manager) — **NOT IMPLEMENTED (#28)**
- [!] **Goal Conversation** — employee voice first, strategy connection made, suggestions reviewed, constraints discussed, goals entered together (Employee + Manager) — **PARTIAL: AI conversation tool covers this but no explicit phase gate or structured flow (#28)**
- [x] **Construction** — required and optional fields completed and validated (Employee + Manager)
- [x] **Activation** — goals embed into dashboards, check-ins, analytics, and confirmation flow (System)
- [!] **Ongoing Management** — status updates, recalibration, midpoint review, completion reflection, end-of-period close (Employee + Manager + HR/People Ops) — **PARTIAL: status updates exist but no mid-period review, completion reflection, or end-of-period close (#28)**

---

## Section 1: Employee View

> Design principle: the employee is not receiving goals; the employee is helping build goals.

### Phase 1: Employee Preparation (48-72 hours before conversation)

- [ ] **EP-1: Strategy Orientation** — review organization strategy pillars and outcomes from Strategy Studio; reflect on which pillar connects most to daily work and which feels furthest from current role; same data the manager sees — **NOT IMPLEMENTED (#28)**
- [ ] **EP-2: Goal Recommendations Review** — review 3-5 AI-generated goal suggestions based on job description, company strategy, and lifecycle stage; note which resonate and which feel off; bring reactions to conversation
- [ ] **EP-3: Personal Aspiration Reflection** — free text: "Where do you want to be 6-12 months from now in your role, skills, or career?"; distilled preview shared with manager before conversation
- [ ] **EP-4: Current Constraints Reflection** — free text: "What might make it hard to achieve your goals this period?"; previewed for manager to enable proactive support

### Phase 2: Goal Conversation (Employee Role)

- [ ] **Move 1: Share Your Vision First** — manager invites employee to share what would make this period meaningful before any suggested goals are presented
- [ ] **Move 2: Listen for Strategy Connection** — after sharing vision, manager connects to strategy pillar; if connection is unclear, employee can ask for clarification
- [ ] **Move 3: React to AI Suggestions** — share honest reactions to Ascenta suggestions; reaction flags visible to manager
- [ ] **Move 4: Name Constraints Openly** — bring EP-4 reflection into conversation; ask directly for support
- [ ] **Move 5: Read Back and Confirm** — read each agreed goal back in own words before confirming; resolve any differences in the moment; goals not finalized until marked as agreed

### Phase 3: Goal Construction (Employee Responsibilities)

- [ ] **Field 1: Objective Statement** — write one sentence naming outcome and its meaning; read aloud test; rewrite if it sounds like a task; minimum 15 words
- [ ] **Field 2: Strategy Pillar Link** — select the strategy pillar this goal supports; ask manager before saving if connection is unclear
- [ ] **Field 3: Key Results** — write 2-4 key results answering: what will be measured, how, and by when; each validated against SMART criteria
- [ ] **Field 4: Goal Type** — select performance or development; aim for balance reflecting current career stage
- [ ] **Field 5: Support Agreement (Review)** — review manager support commitment; hold manager accountable in check-ins
- [ ] **Field 6: Check-in Frequency** — agree on cadence with manager; can request changes through Goals dashboard at any time

### Phase 4: Goal Activation (Employee Steps)

- [ ] **A-1: Goals Dashboard** — confirmed goals appear in Performance System Goals dashboard with status indicators; organizational goals from Strategy Studio appear at top as strategic anchor
- [ ] **A-2: Check-in Integration** — pre-check-in reflection references specific goals by name and asks for progress notes on each
- [ ] **A-4: Confirmation Step** — review each goal carefully after entry; confirmation logged with timestamp and becomes part of performance record

### Phase 5: Ongoing Management (Employee Responsibilities)

- [ ] **EG-1: Status Updates** — update goal status on significant changes (key result completed, blocker encountered, milestone reached); four options: On Track, Needs Attention, Blocked, Complete; manager notified for Blocked or Needs Attention
- [ ] **EG-2: Goal-Linked Self-Reflection** — pre-check-in reflection references each active goal by name; respond to: progress made, most proud of, feeling stuck or uncertain
- [ ] **EG-3: Goal Completion Reflection** — when goal marked complete, four reflection questions: What did you achieve? What did you learn? What would you do differently? What does this make possible next?
- [ ] **Shared: End of Period Goal Close** — confirm Ascenta-generated goal close summary before it locks into performance record; includes goals agreed, completed, recalibrated, still in progress, key results achieved vs missed

### Employee View Functional Requirements

- [ ] Show the same strategy pillars and outcomes the manager sees so alignment is transparent
- [ ] Frame recommended goals around the employee's role, growth stage, and development path
- [ ] Allow the employee to react to suggested goals before the conversation
- [ ] Require clear read-back and confirmation before activation
- [ ] Let the employee update goal status using simple states (On Track, Needs Attention, Blocked, Complete)
- [ ] Trigger completion reflection when a goal is marked complete so learning carries into the next cycle

---

## Section 2: Manager View

> Design principle: the manager is translating strategy into meaningful, realistic goals while preserving employee ownership.

### Phase 1: Manager Preparation (48-72 hours before conversation)

- [ ] **MP-1: Strategy Context Brief** — review 2-3 strategy pillars most relevant to employee's role; auto-populated from Strategy Studio; read-only reference
- [ ] **MP-2: AI Goal Recommendations Review** — review 3-5 goal ideas from Leadership Library recommendation engine using Strategy Studio inputs, mission, vision, values, job description, and lifecycle stage; accept, edit, or dismiss each; decide which 2-3 to propose
- [ ] **MP-3: Employee Aspiration Preview** — review employee's self-stated aspirations from EP-3 response; distilled preview, not raw text
- [ ] **MP-4: Prior Goal Status** — review progress on existing goals: complete, stalled, carry forward, or retire; auto-populated from Goals dashboard; hidden if no prior goals
- [ ] **MP-5: Conversation Intent** — single reflection prompt: "What is the one thing you most want this employee to leave the conversation feeling? Clarity, excitement, or ownership." Shapes suggested opening

### Phase 2: Goal Conversation (Manager Role)

- [ ] **Move 1: Open with Aspiration** — invite employee to share vision first before any suggested goals; suggested opening provided
- [ ] **Move 2: Connect Aspiration to Strategy** — bridge employee vision to organizational direction; name specific strategy pillar or outcome
- [ ] **Move 3: Review AI Suggestions Together** — share Ascenta suggestions; invite employee reaction first; alignment highlighted, divergence flagged; no suggestion becomes a goal without mutual agreement
- [ ] **Move 4: Address Constraints Openly** — reference employee EP-4 constraint reflection; agree on specific support
- [ ] **Move 5: Agree and Enter Together** — enter agreed goals into shared workspace before conversation ends; employee reads back each goal; not finalized until both parties mark as agreed

### Phase 3: Goal Construction (Manager Responsibilities)

- [ ] **Field 1: Objective Statement** — guide employee to write outcome-focused objectives; Ascenta flags activity language
- [ ] **Field 2: Strategy Pillar Link** — confirm pillar link; explain connection if employee cannot see it
- [ ] **Field 3: Key Results** — review for SMART compliance; challenge vague metrics; ensure specific deadlines
- [ ] **Field 4: Goal Type** — ensure balance between performance and development; team with only performance goals is at higher disengagement risk
- [ ] **Field 5: Support Agreement** — name specific commitments (resources, access, introductions, protected time); appears in pre-check-in prompt as standing reminder
- [ ] **Field 6: Check-in Frequency** — set review cadence; default every check-in; adjust for longer timelines

### Phase 4: Goal Activation (Manager Steps)

- [ ] **A-1: Dashboard Embedding** — agreed goals appear in Goals dashboard immediately; manager sees all team goals in single view filtered by pillar, status, and employee; organizational goals at top
- [ ] **A-2: Check-in Cycle Integration** — each goal appears in manager pre-check-in context brief with current status and last employee update; approaching deadlines flagged one cycle before
- [ ] **A-3: Canopy and Vantage Signal** — three signals per employee: goal alignment rate (% linked to pillar), goal balance ratio (performance vs development), goal health score; Vantage aggregates by team, manager, and pillar
- [ ] **A-4: Goal Agreement Confirmation** — both parties confirm before goals go live; unrecognized goal signals conversation failure; confirmation logged with timestamp

### Phase 5: Ongoing Management (Manager Responsibilities)

- [ ] **MG-1: Check-in Goal Discussion** — goal progress as standing agenda item; Ascenta surfaces right goal at right time with current status pre-loaded and deadline proximity flagged
- [ ] **MG-2: Goal Recalibration Trigger** — either party can flag for recalibration; triggers lightweight conversation with four required fields: what changed, revised goal, revised key results, support now needed; original version stays intact
- [ ] **MG-3: Mid-Period Goal Review** — auto-triggered at midpoint; generates review guide with all goals and current status; complete goals archived; at-risk goals flagged for Canopy
- [ ] **Shared: End of Period Goal Close** — both parties formally close each goal; Ascenta generates summary (agreed, completed, recalibrated, in progress, key results achieved vs missed); summary becomes primary input for Performance Review

### Manager View Functional Requirements

- [ ] Show 3-5 AI-recommended goals filtered through strategy, mission, values, job description, and lifecycle stage
- [ ] Allow manager to accept, edit, or dismiss suggested goals before employee conversation
- [ ] Display team and organizational goals above the individual goal workspace
- [ ] Surface employee aspiration preview and constraint preview before conversation begins
- [ ] Embed support agreements into future pre-check-in prompts so manager commitments don't disappear
- [ ] Provide recalibration workflow with required fields: what changed, revised goal, revised key results, revised support needed

---

## Section 3: HR and People Ops View

> Design principle: HR/People Ops does not own each individual goal conversation, but must have visibility, governance, and analytics across the system.

### Strategy Studio Configuration

- [ ] **SS-1: Strategy Pillars** — confirm 3-5 thematic pillars the organization competes on (not values/vision — arenas where the org commits to winning)
- [ ] **SS-2: Outcomes** — each pillar has at least one defined outcome written as an end state, not an activity; flag and coach if written as activities
- [ ] **SS-3: Initiatives** — each initiative has a named owner, start point, and link to at least one outcome; Ascenta blocks unowned or unlinked initiatives
- [ ] **SS-4: Measures** — outcome measures (did we achieve the end state?) and initiative measures (are we executing the work?) are defined and current
- [ ] **SS-5: Roadmap** — validate three-horizon roadmap: short-range (current quarter and next), medium-range (6-18 months), long-range (18 months to 3 years); ensure short-range connects to long-range

### Goal Cycle Administration

- [ ] **GC-1: Cycle Launch** — configure goal setting cycle dates: preparation window open, conversation deadline, confirmation deadline; communicate timeline to all
- [ ] **GC-2: Team Goal Oversight** — review manager-created team goals for quality and alignment to org outcomes; flag disconnected team goals
- [ ] **GC-3: Cascade Integrity** — monitor full cascade: org goals → team goals → individual goals; identify gaps where teams or individuals have no goals linked to org priorities
- [ ] **GC-4: Completion Tracking** — track goal setting completion rates by team, department, and manager; follow up on missed deadlines
- [ ] **GC-5: Quality Assurance** — review sample of individual goals for SMART compliance, strategy alignment, and appropriate difficulty; coach managers whose teams produce low-quality goals

### Canopy and Vantage Analytics

- [ ] **AN-1: Goal Alignment Rate** — % of individual goals linked to a strategy pillar; target 100%; identify low-alignment teams for coaching
- [ ] **AN-2: Goal Balance Ratio** — ratio of performance to development goals across org; at least one development goal per employee; flag teams with zero
- [ ] **AN-3: Goal Health Score** — aggregated indicator: goal status, recalibration frequency, check-in engagement; available by team, manager, department, and pillar
- [ ] **AN-4: Completion and Confirmation Rates** — % goals confirmed by both parties; unconfirmed = conversation quality issues; track by manager for patterns
- [ ] **AN-5: Recalibration Trends** — monitor frequency; high = poor initial goal setting; low in changing conditions = goals being ignored
- [ ] **AN-6: End of Period Summary Review** — review goal close summaries org-wide before performance reviews; identify patterns in achieved vs missed key results; surface systemic barriers

### Leadership Library Oversight

- [ ] **LL-1: Recommendation Engine Inputs** — ensure job descriptions, lifecycle stage data, and Strategy Studio inputs are current; outdated inputs produce irrelevant suggestions that erode trust
- [ ] **LL-2: Suggestion Quality Review** — periodically review AI-generated goal suggestions for relevance, appropriateness, and alignment; log dismissed suggestions to improve recommendations
- [ ] **LL-3: Manager Coaching** — train managers on using AI suggestions as conversation starters, not finished goals; reinforce mutual agreement requirement

### Compliance and Record Keeping

- [ ] **CR-1: Confirmation Audit Trail** — both manager and employee confirmations logged with timestamps; records are immutable; serve as official performance record
- [ ] **CR-2: Recalibration Documentation** — every recalibrated goal retains original alongside revised; four required fields: what changed, revised goal, revised key results, revised support agreement
- [ ] **CR-3: Goal Close Archive** — end-of-period summaries locked into performance record after both-party confirmation; becomes primary input for Performance Reviews
- [ ] **CR-4: Data Retention** — define and enforce retention policies for goal data, recalibration logs, and close summaries per organizational policy and applicable regulations

### HR/People Ops Functional Requirements

- [ ] Provide status and analytics for employees, managers, and HR, with deeper insights reserved for HR/People Ops
- [ ] Aggregate reporting by team, manager, and organizational pillar — show where strategy translates well and where it breaks down
- [ ] Show which managers struggle to create aligned goals or sustain midpoint reviews and check-ins
- [ ] Flag employees with no development goals, stale goals, blocked goals, or missing confirmations
- [ ] Carry goal data into performance reviews, coaching, corrective action, and development planning
- [ ] Support auditability with timestamps, original-vs-recalibrated records, and close summaries

---

## Build Rules

- [ ] Do not allow a goal to go live without both employee and manager confirmation
- [ ] Do not allow a goal to be marked agreed without the four required fields completed
- [ ] Prompt but do not force support agreements and cadence selection
- [ ] Preserve the original goal when recalibration occurs; never overwrite history
- [ ] Make organizational and team context visible in the goal workspace
- [ ] Ensure goals flow into check-ins, reflections, reviews, analytics, coaching, and development

## SMART Goal Reference

Key results are validated against:

- **Specific** — name exactly what will be measured; no vague language without naming the metric
- **Measurable** — include a number, percentage, rating, or clear yes/no outcome
- **Achievable** — ambitious but realistic given constraints, resources, and bandwidth
- **Relevant** — directly connected to objective statement and strategy pillar
- **Time-bound** — specific deadline or review point; "eventually" and "ongoing" are not acceptable

## Goal Script Template

```
[Action Verb] + [What] + [By How Much or To What Standard] + [By When] + [Why or Impact]
```

Example: *Implement a new onboarding program that reduces new hire time to productivity from 90 days to 60 days by June 30, 2025, supporting the company talent retention strategy.*
