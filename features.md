# Ascenta HR Workflow Framework
_AI-first product specification for guided, defensible HR execution_

---

## 0. Product Definition (Non-Negotiable)

Ascenta is **not** a chatbot and **not** a system of record.

Ascenta is a **workflow execution layer for HR work** that:
- Collects structured inputs
- Enforces guardrails and escalation logic
- Generates standardized artifacts
- Requires human review
- Produces a complete audit trail

AI assists with **drafting and organization only**.  
Final decisions always belong to humans.

---

## 1. Core Design Principles

### 1.1 Workflow-First
- No free-text prompting as the primary interface
- All AI actions occur *inside* defined workflows
- Inputs → Guardrails → Outputs → Review → Audit

### 1.2 Guardrails Are the Product
- Risk detection
- Hard stops vs warnings
- HR-only export controls
- “No invented facts” enforcement

### 1.3 Locked Outputs
- Fixed section headers
- Controlled language blocks
- Consistent tone and structure
- Suitable for personnel files and audits

### 1.4 Human-in-the-Loop (Required)
- Mandatory review before:
  - Payroll impact
  - Policy enforcement
  - External communication
  - High-risk documentation

---

## 2. Core Domain Objects (Schema-First)

### 2.1 WorkflowDefinition
- id
- name
- category
- audience (Manager | HR | HR-only)
- risk_level (Low | Medium | High)
- version

### 2.2 IntakeField
- id
- label
- type (dropdown | date | checkbox | short_text)
- required (boolean)
- validation_rules
- options (if dropdown)

### 2.3 Guardrail
- id
- trigger_condition
- severity (hard_stop | warning | escalation)
- required_action (rationale | HR_review | role_lock)

### 2.4 Artifact
- id
- type (letter | summary | script | checklist | memo)
- locked_sections (array)
- export_formats (PDF | DOCX)

### 2.5 WorkflowRun
- workflow_id
- inputs_snapshot (immutable)
- generated_outputs
- guardrails_triggered
- reviewer_id
- timestamps
- version

### 2.6 AuditEvent
- actor
- action
- timestamp
- workflow_version
- input_hash
- output_hash
- rationale (if applicable)

---

## 3. Universal Workflow Drawer (UI Standard)

Every workflow opens in a **right-side drawer** with fixed sections:

1. What Ascenta Guides
2. Inputs Ascenta Asks For
3. Risk Triggers & Escalation
4. Artifacts Generated
5. Time to Complete
6. Who It’s For
7. Run Workflow (Stepper)

Stepper order:
- Intake → Review → Generate → Export → Log

---

## 4. Intake Rules (Global)

- 8–15 total fields
- Prefer dropdowns / checkboxes over text
- Exactly **one** short narrative field (char-limited)
- Live validation required

### Examples
- PIP: goals must include measurable metrics → hard stop
- Investigation: findings without evidence → hard stop
- Corrective action: “final warning” with no prior discipline → warning + rationale required

---

## 5. Guardrails Engine (Executable Logic)

Guardrails are **code**, not prompt text.

### Examples

- IF `final_warning = true` AND `prior_discipline = none`
  → warn + require rationale

- IF `allegation_type IN [harassment, retaliation]`
  → HR-only export + escalation

- IF `substantiated = true` AND `corrective_action = none`
  → warn + require rationale

Guardrail outcomes:
- UI banner
- Required justification field
- Workflow lock
- Permission restriction

---

## 6. Artifact Generation Rules

### 6.1 Locked Structure
- Section headers are immutable
- AI may only populate within allowed sections
- No section creation or deletion

### 6.2 Standard Libraries
- Expectations text library
- Consequences text library
- Policy reference blocks

### 6.3 Tone Rules
- Neutral
- Objective
- No speculation
- No emotional language
- No PHI

---

## 7. “Ask Ascenta” (Guided Intelligence Layer)

Replaces free-text prompting.

### UX
Button: **Ask Ascenta**

Opens curated actions (6–10 max):
- “Turn these facts into a written warning”
- “What information is missing?”
- “What are the risk triggers?”
- “Rewrite this in a firm, respectful tone”
- “Generate a manager coaching script”
- “Create a follow-up checklist”

### Logic
- User selects intent
- System checks missing inputs
- Prompts only run when inputs are complete
- Output constrained to workflow artifact schema

---

## 8. Mandatory Review Screen

Before any export:
- Side-by-side view:
  - Inputs (left)
  - Generated output (right)
- Required checkboxes:
  - Reviewed for accuracy
  - No PHI included
  - Appropriate policy references
- Optional edits (tracked + versioned)

No approval → no export.

---

## 9. Audit Trail Requirements

Every workflow run logs:
- Workflow name + version
- Inputs snapshot
- Output versions (v1, v2, v3…)
- Guardrails triggered
- Reviewer identity
- Export actions + timestamps

Audit data must be:
- Immutable
- Exportable
- Human-readable

---

## 10. Launch MVP Workflows (Build First)

### Hero Workflows
1. Written Warning (Corrective Action)
2. Performance Improvement Plan (30 / 60 / 90)
3. Investigation Summary
4. Holiday Scheduling Fairness (Decision Support)
5. SNF Partner Update / Summary
6. Attendance Pattern Review
7. Termination Recommendation (HR-only)
8. Policy Q&A (guided, citation-backed)
9. Weekly HR Ops Summary
10. SOP Builder (RTF-based)

---

## 11. Decision-Making Workflow: Holiday Scheduling Fairness

### Core Rules
- Each employee: 2 major + 2 minor holidays per year
- Locked holiday taxonomy:
  - Major: New Year’s Day, Thanksgiving, Christmas
  - Minor: Memorial Day, Independence Day, Labor Day, Easter

### Components
- Holiday Eligibility Ledger
- Rotation order logic
- Qualification + constraint checks
- Staffing minimum enforcement

### Outputs
- Draft assignments
- Rationale per assignment
- Swap approval logs
- Ledger updates

### Metrics
- Policy compliance %
- Fairness index
- Override rate
- Dispute rate
- Schedule build time

---

## 12. Customer Experience Workflows (SNF)

### Rules
- Operational + communication only
- No PHI
- Human review required for all external messages

### Features
- Standardized response templates
- Issue taxonomy:
  - Coverage
  - Documentation
  - Timeliness
  - Communication
  - Coordination
- Weekly / monthly partner summaries
- Action tracking with owners + due dates

---

## 13. Deployment Strategy

### Phase 1 (Weeks 1–4)
- No integrations
- CSV uploads
- Controlled shared folders
- Manual review

### Phase 2 (Weeks 5–8)
- Reminder automation
- Routing nudges
- Basic dashboards

### Phase 3 (Optional)
- HRIS API pulls
- BI dashboards
- Optimization tuning

---

## 14. Explicit Non-Goals (Do Not Build)

- Free-form chat
- Open prompting
- Autonomous decision-making
- PHI handling
- “AI HR Assistant” positioning

---

## 15. Product One-Liner (Internal)

**“Ascenta is the guided HR workflow operator that turns messy real-world inputs into compliant, standardized documentation—with guardrails, review, and auditability built in.”**
