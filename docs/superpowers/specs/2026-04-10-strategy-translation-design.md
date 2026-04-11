# Strategy Studio: Strategic Translation — Design Spec

**Date:** 2026-04-10
**Branch:** feat/24-performance-reviews (or dedicated branch per phase)
**Source Document:** Goals Blueprint .docx, Strategy Studio .docx
**Approach:** Bottom-Up (Schema → Engine → Views → Integrations)

---

## Overview

Strategic Translation is the engine within Strategy Studio that converts high-level organizational strategy into role-based language every function and level can act on. It bridges Foundation (mission, vision, values, non-negotiable behaviors, lived principles) and Strategic Priorities into structured outputs: role contribution statements, measurable outcomes, behavioral expectations, decision rights, and alignment descriptors.

This spec covers four phases of implementation, each building on the previous.

---

## Phase 1: Foundation & Priority Schema Enhancements

**Goal:** Capture the full set of inputs the translation engine needs.

### Schema Changes

#### CompanyFoundation (`packages/db/src/foundation-schema.ts`)

Add two new embedded arrays:

```ts
nonNegotiableBehaviors: [
  { name: String (required), description: String (required) }
]
livedPrinciples: [
  { name: String (required), description: String (required) }
]
```

These are structured name+description pairs so the translation engine can reference each individually when generating behavioral expectations and alignment descriptors. The existing `values` field (rich text) stays as-is.

#### StrategyGoal (`packages/db/src/strategy-goal-schema.ts`)

Add one field:

```ts
rationale: { type: String, default: "" }
```

Explains why this priority was chosen — the business case. Used by the translation engine to produce more grounded contribution language.

### Validation Changes

- `foundationFormSchema` (`lib/validations/foundation.ts`): add optional arrays for `nonNegotiableBehaviors` and `livedPrinciples`, each item requiring `name` (min 1 char) and `description` (min 1 char)
- `strategyGoalFormSchema` (`lib/validations/strategy-goal.ts`): add optional `rationale` string

### UI Changes

#### Foundation Panel (`components/plan/foundation-panel.tsx`)

Add two new sections below Values:

- **"Non-Negotiable Behaviors"** — list of name+description items with inline add/remove/edit. Same auto-save-on-blur behavior as existing MVV fields. Same draft/publish workflow.
- **"Lived Principles"** — same pattern as non-negotiable behaviors.

Both sections render in read-only card layout when published, editable textareas when in draft (matching existing MVV pattern).

#### Strategy Goal Form (`components/plan/strategy-goal-form.tsx`)

- Add "Rationale" textarea between description and horizon fields
- Placeholder: "Why is this a priority? What's the business case?"

#### Strategy Panel (`components/plan/strategy-panel.tsx`)

- Show rationale in expanded goal detail view (below description, above success metrics)
- Add soft warning banner when company-scope goals are <3 or >5: "Strategy Studio recommends 3-5 enterprise priorities per planning cycle."

### AI Tool Updates

- `buildMVVTool` (`lib/ai/plan-tools.ts`): extend conversation flow to guide through non-negotiable behaviors and lived principles after values. New steps: "What behaviors are absolutely non-negotiable regardless of role?" and "What lived principles guide how work gets done day-to-day?"
- `getStrategyBreakdownTool` (`lib/ai/strategy-tools.ts`): include `nonNegotiableBehaviors` and `livedPrinciples` in the returned foundation object

### API Route Updates

- `POST/PATCH /api/plan/foundation`: accept and persist new fields
- `GET /api/plan/foundation`: return new fields
- `POST /api/plan/strategy-goals`: accept rationale
- `PATCH /api/plan/strategy-goals/[id]`: accept rationale
- `GET /api/plan/strategy-goals`: return rationale

### Seed Data Updates

- `scripts/seed-strategy.ts`: add sample non-negotiable behaviors (e.g., "Transparency in decision-making", "Psychological safety in feedback"), sample lived principles (e.g., "Default to action over consensus", "Own the outcome, not just the task"), and rationale for each seeded strategy goal

---

## Phase 2: Strategic Translation Engine

**Goal:** Build the AI-powered system that converts Foundation + Priorities into structured, role-based language and persists it.

### Data Model

New schema: `StrategyTranslation` in `packages/db/src/strategy-translation-schema.ts`

```ts
{
  department: String (required, indexed),
  version: Number (required, auto-incremented per department),
  status: enum ["generating", "draft", "published", "archived"] (required, indexed),

  // What inputs produced this translation (for staleness detection)
  generatedFrom: {
    foundationId: ObjectId (ref CompanyFoundation),
    foundationUpdatedAt: Date,
    strategyGoalIds: [ObjectId] (ref StrategyGoal),
    generatedAt: Date,
  },

  // Translated output — one entry per role/level in the department
  roles: [
    {
      jobTitle: String (required),
      level: enum ["executive", "manager", "individual_contributor"] (required),

      // Per-priority contribution language
      contributions: [
        {
          strategyGoalId: ObjectId (ref StrategyGoal),
          strategyGoalTitle: String (denormalized for display),
          roleContribution: String,    // What this role contributes toward this priority
          outcomes: [String],           // Measurable results demonstrating alignment
          alignmentDescriptors: {
            strong: String,
            acceptable: String,
            poor: String,
          },
        }
      ],

      // Values-derived behavioral expectations
      behaviors: [
        { valueName: String, expectation: String }
      ],

      // What this level can decide, recommend, or must escalate
      decisionRights: {
        canDecide: [String],
        canRecommend: [String],
        mustEscalate: [String],
      },
    }
  ],

  timestamps (createdAt, updatedAt),
}
```

New constants file: `packages/db/src/strategy-translation-constants.ts` — exports `TRANSLATION_STATUSES`, `ROLE_LEVELS`, labels.

One document per department per version. When strategy changes, a new version is generated — old versions are archived, never overwritten.

### Translation Engine

New AI tool: `generateStrategyTranslationTool` in `lib/ai/strategy-tools.ts`

**Inputs:** `department` (string, or `"all"` to batch)

**Execute flow:**
1. Load published Foundation (mission, vision, values, non-negotiable behaviors, lived principles)
2. Load active company + department StrategyGoals (non-archived)
3. Load distinct job titles from Employee collection for that department; infer level from job title keywords (titles containing Director/VP/Chief/Head → executive; Manager/Lead/Supervisor → manager; everything else → individual_contributor). This is a heuristic — HR can override role levels in the translation editor before publishing.
4. For each role, generate structured output using AI with a Zod-validated response schema:
   - Contribution statements per priority (anchored to mission)
   - Measurable outcomes per priority (shaped by vision)
   - Behaviors per value (contextualized to the role)
   - Decision rights (calibrated to level)
   - Alignment descriptors (non-negotiable behaviors set the "poor" floor)
5. Assemble into a `StrategyTranslation` document, store in `draft` status
6. Return summary of what was generated

**Prompt engineering — how pillars govern output:**
- **Mission** → anchors every role contribution statement ("in service of [mission]")
- **Vision** → shapes forward-looking outcomes ("moving toward [vision]")
- **Core Values** → each value produces a behavioral expectation per role
- **Non-negotiable behaviors** → set the floor for "poor" alignment descriptors
- **Strategic Priorities** → determine the substance of each contribution statement
- **Planning Horizons** → short-term priorities produce tactical language, long-term produce developmental/capability-building language

Generation is per-role to stay within output token limits, then assembled into the full document.

**Staleness detection:** Compare `generatedFrom.foundationUpdatedAt` and `generatedFrom.strategyGoalIds` against current Foundation and StrategyGoal state. If inputs changed after `generatedFrom.generatedAt`, the translation is stale.

### API Routes

`/api/plan/strategy-translations/`
- **POST** — trigger generation for a department (body: `{ department: string }`) or all departments (`{ department: "all" }`). Generation is async: creates a new version in "generating" status, returns immediately with the translation ID, generates roles sequentially server-side, updates status to "draft" on completion. The UI polls GET with the translation ID to track progress.
- **GET** — fetch translations. Query params: `department`, `status`, `includeArchived`. Default: returns published translations only.

`/api/plan/strategy-translations/[id]`
- **GET** — fetch single translation with full role details
- **PATCH** — actions: `publish` (sets status, archives previous published version for same department), `archive`, or field edits to individual role entries before publishing

### UI

Add **"Translations"** tab to Strategy Studio (third tab alongside Foundation and Strategy).

Content:
- Per-department card grid showing: department name, translation status (published/draft/stale/missing), last generated date, role count
- "Generate" button per department card, "Generate All" button in header
- Generation progress indicator (status polling while "generating")
- Click a department card to expand: preview translated content grouped by role, with contribution/outcomes/behaviors/decision rights for each
- Publish / Archive action buttons
- Staleness warning badge when inputs changed since last generation

Components:
- `components/plan/translations-panel.tsx` — main tab content
- `components/plan/translation-department-card.tsx` — per-department status card
- `components/plan/translation-role-preview.tsx` — role detail preview within expanded department

### Seed Data

- `scripts/seed-strategy-translations.ts`: generate sample translations for 2-3 departments (Engineering, HR, Product) with 2-3 roles each, all in "published" status, aligned to seeded strategy goals

---

## Phase 3: Three Role-Based Views

**Goal:** Surface translated output to each audience in a format tailored to how they use it.

### Approach

One adaptive view — **"My Strategy"** — that renders differently based on `useRole()` context. This avoids three separate pages and users wondering which view they belong in.

Added as a new page config in `dashboard-nav.ts` under the `plan` category — a sibling to Strategy Studio, not a tab within it. Strategy Studio is the admin tool for managing strategy inputs and translations. My Strategy is the consumer-facing view that reads published translations. Keeping them separate reinforces that distinction.

### Employee View (Individual Contributors)

When an IC visits My Strategy:

**Header:** "What This Means For You" — employee name, job title, department

**Strategy Connection:** For each active company + department priority:
- Priority title and horizon badge
- Their specific role contribution statement (from published translation)
- "What success looks like" — the measurable outcomes for their role
- "Behaviors expected" — values-derived expectations specific to their role

**Decision Clarity:** What they can decide on their own, what to recommend upward, what to escalate

Read-only. No editing. Language should feel personal and actionable.

### Manager View

Everything an employee sees for their own role, plus:

**Team Strategy Dashboard:** Table of direct reports showing:
- Name and job title
- Whether a published translation exists for their role
- Summary of primary contribution per top priority

**Cascaded Goals Context:** Company priorities → department priorities → contribution language for each role on their team. The "cheat sheet" for setting goals, writing JDs, preparing for check-ins and reviews.

**Support Commitments:** Active goal support agreements for their reports, surfaced as reminders.

### Executive / HR View

Everything a manager sees, plus:

**Cross-Department Translation Status:** Which departments have published translations, which are stale, which are missing.

**Capability Needs Matrix:** For each strategic priority, which departments have translated contribution language and which don't. Gaps = where strategy isn't reaching yet.

**Translation Health Stats:**
- Departments with published translations vs total departments
- Translations generated in last 30/60/90 days
- Stale translations (inputs changed since generation)

### Navigation

- `dashboard-nav.ts`: add `my-strategy` page config under `plan` category
- Role-based conditional rendering via `useRole()` — no separate routes
- Cross-links from Goals panel: "See how this connects to strategy" → My Strategy

### Components

- `components/plan/my-strategy-view.tsx` — main adaptive view, reads from published translations
- `components/plan/strategy-contribution-card.tsx` — reusable card for a single priority's contribution/outcomes/behaviors
- `components/plan/team-strategy-table.tsx` — manager's direct report strategy summary
- `components/plan/translation-health-dashboard.tsx` — HR's cross-department governance view

---

## Phase 4: Downstream Integrations

**Goal:** Wire published translation outputs into existing Grow/Plan systems so translated language drives goals, reviews, check-ins, and coaching.

### Integration 1: Goals (Grow)

**Current:** `startGoalWorkflowTool` loads raw strategy goals for recommendation context.

**Change:** When the goal workflow reaches the recommendation step (Step 3), also load the published `StrategyTranslation` for the employee's department + job title. Use role contribution statements and outcomes as the basis for goal suggestions.

- `startGoalWorkflowTool` execute: load translation alongside strategy goals, return `roleContributions` and `outcomes` in response
- Update tool description Step 3: "Generate goal recommendations from the employee's translated role contributions and outcomes, not from raw priority titles. Each suggested goal should trace back to a specific contribution statement."
- New optional field on Goal schema: `contributionRef: String` — the role contribution text the goal was derived from, for traceability
- If no published translation exists for the department, fall back to current behavior (raw strategy goals)

### Integration 2: Performance Reviews

**Current:** Review workflow pulls goals and strategy context but doesn't reference translation outputs.

**Change:** When the review workflow gathers context (Step 1 of review cycle), also load alignment descriptors for the employee's role.

- AI-drafted review comments reference alignment descriptors: "Strong alignment looks like [X]. Based on the evidence, this employee demonstrated [Y]."
- Review form surfaces alignment descriptors as a read-only reference panel — manager sees what strong/acceptable/poor looks like per priority
- New field on review sections: `alignmentLevel: "strong" | "acceptable" | "poor" | null` — manager selects after reading descriptors
- If no translation exists, review proceeds without descriptors (graceful degradation)

### Integration 3: Check-Ins

**Current:** `startCheckInTool` collects observations and progress without strategy context or support agreement references.

**Change:**
- When starting a check-in, load published translation for the employee's role
- Return role contribution statements and active goal support agreements in tool context
- Update check-in system prompt: "Reference the employee's strategic contribution expectations when prompting for progress observations. Surface any support agreements the manager committed to."
- Check-in form gets a read-only "Strategy Context" collapsed section at top showing the employee's contribution language for current priorities

### Integration 4: Coaching & Corrective Action

**Current:** Corrective action workflows generate documents with no connection to strategy translation.

**Change:** Prompt-level integration only (no schema changes):
- When a corrective action references an employee, load their alignment descriptors if available
- Update corrective action system prompt: AI can reference "The expected behavior per [priority] is [strong alignment descriptor]. The observed behavior falls under [poor alignment descriptor]."
- Surfaces naturally in AI-drafted language — no new UI

### Integration 5: Strategy Breakdown ATC Enhancement

**Current:** `getStrategyBreakdownTool` returns raw foundation + strategy goals. `generateStrategyBriefTool` creates an AI-synthesized brief.

**Change:**
- `getStrategyBreakdownTool`: when a published translation exists for the employee's department/role, add `translatedContributions`, `translatedBehaviors`, `decisionRights` to the response
- `generateStrategyBriefTool`: use translated language as the authoritative source rather than AI-synthesizing on the fly
- Fall back to current behavior (raw data + AI synthesis) when no published translation exists

### Explicitly Out of Scope

These are referenced in the Strategy Studio document but depend on modules that don't exist yet:

- **Reflect** (two-way conversations grounded in strategy language) — module not built
- **Leadership Library** (strategic conversation starters from translated language) — module not built
- **Alignment Reporting / Canopy** (tracking whether goals and reviews reference priorities consistently) — analytics infrastructure, separate future effort

---

## Phase Summary & Dependencies

```
Phase 1: Foundation & Priority Schema Enhancements
  └── Unblocks: Phase 2 (translation engine needs these inputs)

Phase 2: Strategic Translation Engine
  ├── Depends on: Phase 1
  └── Unblocks: Phase 3 (views read from stored translations)
                Phase 4 (integrations read from stored translations)

Phase 3: Three Role-Based Views
  ├── Depends on: Phase 2
  └── Independent of: Phase 4

Phase 4: Downstream Integrations
  ├── Depends on: Phase 2
  └── Independent of: Phase 3
```

Phases 3 and 4 can be worked in parallel once Phase 2 is complete.

## Design Principles (from source document)

- Strategy is the compass, not the scoreboard — Ascenta does not build OKR dashboards or finance reporting
- Translation exists to ensure the compass reading reaches every role in language that is specific, actionable, and aligned
- Foundation and Strategic Priorities don't just inform translation — they govern it
- Translations are versioned and never overwritten — history is preserved
- Downstream systems gracefully degrade when no translation exists (fall back to raw strategy data or proceed without)
