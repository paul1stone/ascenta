# Check-Ins

> Grow Module | Performance System | Employee View | Manager View | HR / People Ops View

## Overview

Check-ins sit within Performance System alongside Goals, Performance Reviews, and Reflect. Check-in data feeds into Canopy for HR/People Ops and into Vantage for executive trend visibility through aggregate signals only.

The Leadership Library is woven into the Check-in experience. Manager prompts, recognition language, developmental questions, gap recovery guidance, and coaching behaviors are filtered through the organization's mission, vision, values, and leadership standards.

### Check-in Lifecycle

| Moment | Timing | Who Acts | Purpose |
|---|---|---|---|
| Prepare | 48 hours before | Manager and Employee independently | Reflect, set agenda, build context |
| Participate / Guide | Scheduled check-in time | Employee opens, Manager guides | Dialogue, recognition, development |
| Reflect | Within 24 hours after | Manager and Employee independently | Capture signals, commit forward, seed next cycle |

---

## Employee View

> The employee enters every Check-in with a clear voice, a defined agenda, and the confidence that their perspective will be heard before the manager sets direction. Employee inputs are private unless distilled for specific purposes.

### Prepare (48 hours before)

Employee receives three self-reflection prompts. Responses submitted before conversation begins. A distilled, non-verbatim preview shared with manager 24 hours before.

- [ ] **Progress Reflection** — "What progress have you made toward your goals or commitments since your last Check-in? What are you most proud of from this period?" Tied to active goals in the Goals feature. Employee can reference specific goals by name. Distilled preview routed to manager context briefing. — **NOT IMPLEMENTED (#29)**
- [ ] **Stuck Point Reflection** — "Where do you feel stuck, uncertain, or in need of more support right now? What would help most?" Free text. Distilled preview informs manager opening move. Named stuck points become primary conversation agenda. — **NOT IMPLEMENTED (#29)**
- [ ] **Conversation Intent** — "What is the one thing you most want to leave this conversation with: a decision, a piece of feedback, a plan, or something else?" Sets employee agenda before manager sets theirs. Distilled preview shared with manager. — **NOT IMPLEMENTED (#29)**

### Participate

Employee does not see a conversation guide during the Check-in. The structural design ensures the employee voice leads.

- [ ] **Employee Opens First** — conversation always begins with employee perspective before manager shares anything; employee-first opening produces real information, not reactive alignment — **NOT IMPLEMENTED (#29)**
- [ ] **Stuck Point Addressed** — employee flagged stuck point addressed as second conversation move; signals manager read the preparation and employee concerns have priority — **NOT IMPLEMENTED (#29)**
- [ ] **Mutual Commitment** — employee names one concrete next step at close; feeds into next cycle Progress Reflection for continuity — **NOT IMPLEMENTED (#29)**
- [ ] **Values-Aligned Communication** — employee experiences communication shaped by the Leadership Library and MVV; recognition, coaching, and responses guided by company mission, vision, values, and leadership standards — **NOT IMPLEMENTED (#29)**

### Reflect (within 24 hours after)

Notification sent within one hour of scheduled end time. Reminder at 12 hours if incomplete. Window closes at 24 hours. Employee Reflect responses are never shared with the manager directly — they feed into the perception gap comparison engine only.

- [ ] **Heard Dimension** — "Did you feel like your perspective was genuinely heard in this conversation, not just acknowledged, but actually heard?" Routed to overall conversation quality signal. Persistent low scores across multiple cycles trigger a Reflect. — **NOT IMPLEMENTED (#29)**
- [ ] **Clarity Dimension** — "Do you feel clear on what you committed to in this conversation, and do you feel confident you can deliver on it before the next Check-in?" Compared against manager clarity response. Divergence generates a clarity gap signal. — **NOT IMPLEMENTED (#29)**
- [ ] **Recognition Dimension** — "Did you feel that your contributions from this period were seen and named specifically, not just acknowledged in a general way?" Compared against manager recognition response. Most common gap dimension in the platform. — **NOT IMPLEMENTED (#29)**
- [ ] **Development Dimension** — "Did this conversation feel focused on your growth and future, or did it feel more like a review of what has already happened?" Compared against manager development response. Persistent mismatch generates a development gap signal. — **NOT IMPLEMENTED (#29)**
- [ ] **Safety Dimension** — "Did you feel comfortable being fully honest in this conversation, including about things that are not going well or that you are uncertain about?" Compared against manager safety response. Safety gaps escalate to HR faster. Employee response never shared with manager directly. — **NOT IMPLEMENTED (#29)**

---

## Manager View

> The manager is equipped with structured preparation, a lightweight conversation guide, and a reflective close. Contextual prompts calibrated to employee lifecycle stage, organization values, and signals from prior cycles. Manager sees distilled employee input but never raw employee text.

### Prepare: Context View (48 hours before)

- [ ] **Context Briefing** — persistent context bar showing where employee is right now; pulls from employee lifecycle stage, last cycle forward action commitment, and employee self-reflection preview; not a prompt to act on but a lens to carry through the session — **NOT IMPLEMENTED (#29)**
- [ ] **Gap Recovery (Conditional)** — reconnection prompt that appears only if a gap signal is present from prior cycle; warm recovery language, never corrective; e.g., "Your last Check-in may have left some room on recognition. Consider opening with: I want to make sure I said this clearly." — **NOT IMPLEMENTED (#29)**
- [ ] **Leadership Library Guidance** — prompt language, recognition examples, coaching guidance, and conversation support filtered through organization MVV and leadership standards — **NOT IMPLEMENTED (#29)**

### Prepare: Conversation Toolkit

- [ ] **Opening Move** — suggested opening drawn from distilled employee self-reflection; distilled to one sentence; signals dialogue before monologue; manager can adapt or use verbatim — **NOT IMPLEMENTED (#29)**
- [ ] **Recognition Prompt** — prompt to name something specific and values-anchored; filtered through client organization values from Strategy Studio; flags vague praise as insufficient
- [ ] **Developmental Question** — open growth question calibrated to employee lifecycle stage; lifecycle stage set at onboarding and updated at key milestones; Ascenta selects appropriate variant automatically
- [ ] **Closing Anchor** — "Before we wrap, let us each name one thing we are committing to before we talk again. I will go first." Manager commitment feeds into next cycle context briefing. Employee commitment feeds into post Check-in.

### Guide (Conversation Structure)

- [ ] **Move 1: Open with the Employee** — employee reflection comes first, always; suggested prompt provided
- [ ] **Move 2: Address Stuck Point** — go to employee flagged need before manager agenda; signals manager read the preparation
- [ ] **Move 3: Recognition, Development, Performance** — recognition first, development second, performance last and only if needed; recognition is values-anchored via Leadership Library; development guidance is lifecycle-calibrated
- [ ] **Move 4: Close with Mutual Commitment** — both parties name one concrete next step; both commitments logged in Reflect phase; manager commitment becomes opening context line of next Prepare phase

### Reflect (within 24 hours after)

- [ ] **Clarity Dimension** — "What specific next step or commitment did this employee leave this conversation with? If you are not certain, what might that tell you?" Routed to next cycle context briefing. Compared against employee clarity response.
- [ ] **Recognition Dimension** — "Did you name something specific this employee did well, not generally, but something particular to this period? What was it?" Compared against employee recognition response. Mismatch generates recognition gap signal for next cycle.
- [ ] **Development Dimension** — "How much of this conversation was about this employee growth versus current performance? Does that balance feel right given where they are right now?" Compared against employee development response. Persistent gaps surface to Canopy after three consecutive cycles.
- [ ] **Psychological Safety Dimension** — "Was there anything in this conversation that felt unfinished, avoided, or harder to say than it should have been? If so, what got in the way?" Compared against employee safety response. Safety gaps escalate faster.
- [ ] **Forward Action** — "What is the one thing you want to make sure you do differently or follow up on before the next Check-in?" Becomes opening line of context briefing in next Prepare phase.

---

## HR / People Ops View

> Organizational visibility without exposing individual reflection content. HR never sees raw employee or manager text. All signals arrive as aggregate, dimension-level patterns surfaced through Canopy.

### Monitor

- [ ] **Individual Reflection Content** — HR never sees individual employee or manager reflection text; remains private unless a defined safety escalation threshold is crossed
- [ ] **Gap Signals** — HR sees aggregate dimension-level gap signals only; generated by perception gap engine after comparing manager and employee Reflect responses across Clarity, Recognition, Development, and Safety
- [ ] **Manager Visibility First** — managers always see their own gap signals before HR does; gap signal delivered to manager as private nudge first; HR receives visibility only after escalation threshold is met
- [ ] **Leadership Library Surfacing Log** — HR can see which Leadership Library content has been surfaced to managers; when a manager consistently logs gaps, Ascenta surfaces relevant content; HR can see surfacing history
- [ ] **Reflect Trigger Visibility** — HR can see when a Reflect has been triggered and its current status; cannot see content of Reflect conversation itself

---

## Cross-View Requirements

### Client Onboarding Inputs

- [ ] **Mission, Vision, and Values** — used to filter recognition prompts and developmental questions; captured during onboarding in Strategy Studio; Leadership Library uses these as communication framework
- [ ] **Strategic Priorities** — used to calibrate goal alignment and closing commitments; captured in Strategy Studio
- [ ] **Lifecycle Stage Definitions** — four stages: Onboarding, Development Stretch, Plateau Risk, and Transition; set at onboarding and updated at key milestones; used to select correct developmental question variant
- [ ] **Check-in Cadence** — default biweekly, configurable per team or role type; determines timing of all Prepare and Reflect notifications and windows

### Loop Mechanism

- [ ] **Forward Action to Context Briefing** — manager forward action feeds into next Prepare phase as opening line of context briefing
- [ ] **Clarity to Progress Reflection** — employee clarity response anchors next Progress Reflection for continuity
- [ ] **Gap Signals to Gap Recovery** — active gap signals feed into conditional gap recovery prompt in manager's next context view
- [ ] **Pattern Signals to Canopy** — three or more consecutive cycles with same gap dimension feed into Canopy; persistent patterns are the only data that surfaces beyond the manager/employee pair
- [ ] **Reflect Linkage** — persistent gap signals, safety issues, lifecycle milestones, or direct requests can route the relationship into Reflect for deeper two-way conversation

### Trigger Logic and Timing

- [ ] **Prepare Delivery** — delivered to both manager and employee 48 hours before scheduled Check-in; prepare independently; neither party sees other's preparation until conversation begins
- [ ] **Employee Preview to Manager** — distilled employee self-reflection arrives to manager 24 hours before; delivered after employee completes reflection; preview is distilled, not verbatim
- [ ] **Reflect Notification** — sent to both parties within one hour of scheduled end time; reminder at 12 hours; window closes at 24 hours
- [ ] **Gap Signal Generation** — generated within one hour of both Reflect responses being locked; manager receives private nudge; HR Canopy signal generated only after threshold met
- [ ] **Leadership Library Surfacing** — relevant content surfaced in manager Prepare flow when persistent gaps detected; Library becomes timely resource, not static menu

---

## Data Privacy Architecture

| Data Element | Employee Sees | Manager Sees | HR Sees |
|---|---|---|---|
| Employee Self-Reflection (Prepare) | Own responses only | Distilled preview only, never raw text | Nothing |
| Manager Preparation (Prepare) | Nothing | Full context view and toolkit | Nothing |
| Manager Reflect Responses | Nothing | Own responses only | Nothing, unless safety escalation threshold crossed |
| Employee Reflect Responses | Own responses only | Nothing | Nothing, unless safety escalation threshold crossed |
| Gap Signals | Nothing | Own signals first, as private nudge | Aggregate dimension-level signals after threshold |
| Pattern Signals (3+ cycles) | Nothing | Own patterns | Aggregate signals via Canopy |
| Reflect Trigger Status | Visible when triggered | Visible when triggered | Trigger status visible, conversation content not visible |

---

## Technical Node Reference

### Manager Nodes

- [ ] **M-1** — Context View: Context Briefing; pulls from lifecycle stage, prior forward action, and distilled employee self-reflection
- [ ] **M-2** — Conversation Toolkit: Opening Move; derived from distilled employee self-reflection preview
- [ ] **M-3** — Conversation Toolkit: Recognition Prompt; filtered through client organization values and Leadership Library guidance
- [ ] **M-4** — Conversation Toolkit: Developmental Question; selected by lifecycle stage
- [ ] **M-5** — Conversation Toolkit: Closing Anchor; static prompt, output feeds next cycle M-1
- [ ] **M-6** — Context View: Gap Recovery (Conditional); triggered by perception gap engine from prior cycle

### Manager Reflect Nodes

- [ ] **MP-1** — Reflect: Clarity Dimension; routes to next cycle M-1 context briefing; compared against EP-2
- [ ] **MP-2** — Reflect: Recognition Dimension; compared against EP-3; mismatch generates M-6 next cycle
- [ ] **MP-3** — Reflect: Development Dimension; compared against EP-4; persistent gaps surface to Canopy after three cycles
- [ ] **MP-4** — Reflect: Psychological Safety Dimension; compared against EP-5; safety gaps escalate to HR after two cycles
- [ ] **MP-5** — Reflect: Forward Action; feeds directly into next cycle M-1 as opening context line

### Employee Nodes

- [ ] **E-1** — Prepare: Progress Reflection; tied to active Goals; distilled preview routed to M-1
- [ ] **E-2** — Prepare: Stuck Point Reflection; free text; distilled preview informs M-2 opening move
- [ ] **E-3** — Prepare: Conversation Intent; sets employee agenda; distilled preview shared with manager

### Employee Reflect Nodes

- [ ] **EP-1** — Reflect: Heard Dimension; overall quality signal; persistent low scores trigger Reflect
- [ ] **EP-2** — Reflect: Clarity Dimension; compared against MP-1; divergence generates clarity gap signal
- [ ] **EP-3** — Reflect: Recognition Dimension; compared against MP-2; most common gap dimension
- [ ] **EP-4** — Reflect: Development Dimension; compared against MP-3; persistent mismatch generates development gap
- [ ] **EP-5** — Reflect: Safety Dimension; compared against MP-4; escalates to HR faster; never shared with manager directly
