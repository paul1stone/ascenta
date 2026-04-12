# Strategy Studio: Strategic Translation

> How Foundation and Strategic Priorities convert into role-based language.

## Purpose

Strategic Translation converts high-level organizational strategy into language every role can act on. It bridges the gap between what leadership defines as critical and what each department, function, and contributor experiences day to day.

---

## Screen 1: Foundation

- [x] Leadership can define the organization's **mission** (why it exists)
- [x] Leadership can define the organization's **vision** (where it is headed)
- [x] Leadership can define **core values** that shape culture
- [x] Foundation elements are persisted and serve as cultural anchor for all translated outputs

## Screen 2: Strategic Priorities

- [x] Leadership can enter **3-5 enterprise priorities** with rationale for each
- [x] Priorities are organized across **planning horizons**:
  - [x] Short-term (0-12 months)
  - [x] Mid-range (1-3 years)
  - [x] Long-term (3-5 years)
- [x] Each priority includes a **definition of success**
- [x] Each priority includes a **planning timeframe**
- [x] Priorities serve as directional pillars mapped into all downstream outputs

## Strategic Translation Engine

- [!] AI-powered engine converts Foundation + Strategic Priorities into structured, role-based language — **BUG: hardcoded to OpenAI, fails with 500 when OPENAI_API_KEY missing; orphaned "generating" records (#25)**
- [x] Translation is organized by **function** and **contribution level**
- [x] Leadership retains control of the output (review/edit capability)

### Translation Outputs

For each department and function, the translation generates:

- [x] **Role Contribution** — what each role is expected to contribute toward each strategic priority
- [x] **Outcomes** — measurable results demonstrating alignment between the role and the priority
- [x] **Behaviors** — observable actions reflecting core values within the role context
- [x] **Decision Rights** — clarity on what each level of contributor is empowered to decide, recommend, or escalate
- [x] **Alignment Descriptors** — what strong, acceptable, and poor alignment looks like for each role relative to each priority

### Pillar Governance

Each translated output must be shaped by the pillars in these specific ways:

- [x] **Mission** anchors every role contribution statement to the reason the organization exists
- [x] **Vision** shapes forward-looking outcomes and growth indicators within each role
- [x] **Core Values** define behavioral expectations embedded in every role and set the floor for alignment descriptors (woven in, not a separate section)
- [x] **Strategic Priorities** determine the substance of each role contribution statement, mapped to priorities and horizons
- [x] **Planning Horizons** calibrate expectations by timeframe:
  - [x] Short-term priorities produce immediate, tactical role language
  - [x] Long-term priorities produce developmental and capability-building language

## Three Role-Based Views

### Executive View

- [x] Surfaces enterprise priorities and capability needs required to execute them — *via TranslationHealthDashboard (coverage stats, dept status)*
- [x] Helps senior leaders see whether strategic intent is translating into the right focus areas across functions

### Manager View

- [x] Delivers department and team-level focus areas — *via TeamStrategyTable*
- [x] Provides cascaded goals
- [x] Provides specific contribution language for:
  - [x] Building aligned job descriptions
  - [x] Setting meaningful goals
  - [x] Conducting effective check-ins and reviews

### Employee View

- [x] Provides individual contributors with clear, personal alignment language — *"What This Means For You" view*
- [x] Shows what they are expected to contribute
- [x] Shows what success looks like
- [x] Shows how day-to-day work connects to the bigger picture

## Downstream Integrations

Strategic Translation feeds into the following Ascenta systems:

### Goals (within Grow)

- [x] Translated role contribution and outcome language populates **suggested goals** — *via `getTranslationForEmployee()` in grow-tools*
- [x] Employees select goals that are already pre-aligned to strategic priorities — *`contributionRef` + `strategyGoalId` persisted*

### Performance Reviews

- [!] Alignment descriptors (strong, acceptable, poor) provide the **evaluation framework** — **PARTIAL: strategy goals linked via goal IDs, but translation layer not called in review tools (#27)**
- [!] Reviewers assess contribution against language that traces back to strategy — **PARTIAL: foundation data used, alignment descriptors not injected (#27)**

### Check-Ins

- [x] Managers use translated language to prepare for and guide ongoing conversations — *`getTranslationForEmployee()` called in startCheckInTool*
- [x] Covers progress, blockers, and support needs

### Reflect

- [ ] Two-way conversations are grounded in strategic contribution language — **NOT IMPLEMENTED: nav tab only, no feature code (#26)**
- [ ] Provides both manager and employee a shared reference point — **NOT IMPLEMENTED (#26)**

### Coaching and Corrective Action

- [!] Development plans tied to capability gaps identified through the translation — **PARTIAL: alignment descriptors referenced in system prompt only, not auto-injected into corrective action tools (#26)**
- [ ] Reinforced through alignment reporting — **NOT IMPLEMENTED (#26)**

### Leadership Library

- [ ] Strategic thinking guides built on translated language — **NOT IMPLEMENTED: generic chat shell, no content store (#26)**
- [ ] Cascading conversation starters use the same strategic vocabulary — **NOT IMPLEMENTED (#26)**

### Alignment Reporting and Canopy

- [ ] Reporting tracks whether goals and reviews reference strategic priorities consistently — **NOT IMPLEMENTED: placeholder page only (#26)**
- [ ] Surfaces where translation is landing and where gaps remain — **NOT IMPLEMENTED (#26)**

## Design Principle

> Ascenta does not build enterprise KPI dashboards, OKR scorecards, or finance reporting. Strategy is the compass, not the scoreboard. Strategic Translation exists to ensure that the compass reading reaches every role in the organization in language that is specific, actionable, and aligned to the direction leadership has set.
