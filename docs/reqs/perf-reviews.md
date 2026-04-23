# Performance Reviews

> Ascenta | Grow | Performance System | Performance Reviews
> Process Flow, Review Categories, Research Foundation, and System Connections

## Overview

Performance Reviews in Ascenta are embedded within a continuous performance system — not a standalone annual event. Reviews combine ongoing check-ins, mid-year reviews, and annual reviews; require employee self-assessment first; enforce competency-anchored behavioral rating scales; and produce documented development plans. Categories are intentionally broad to fit any company, with Strategy Studio populating the Culture and Values Alignment category per organization.

---

## Design Principles (Research Foundation)

### Six Structural Failures Ascenta Solves

- [x] **Solve annual-only cadence** — embed reviews within a continuous system of ongoing check-ins, mid-year reviews, and annual reviews working together (not annual-only) — *`REVIEW_TYPES` includes annual, mid_year, ninety_day, custom; period selector in ReviewsPanel*
- [!] **Solve backward-looking design** — every review is 40% retrospective and 60% forward-looking, covering goals achieved, development priorities, and specific support and commitments for the next period — **PARTIAL: dev plan captures forward-looking fields, but no structural enforcement of 40/60 split or dedicated forward-looking questions in category forms (#52)**
- [x] **Solve manager-only ratings without data** — supplement manager judgment with multi-source data: self-assessments, continuous feedback records, goal completion data, and peer input; Ascenta surfaces all automatically — *evidence panel in ManagerAssessmentForm surfaces goals, check-ins, performance notes*
- [x] **Solve absence of employee voice** — require employee self-assessment first and include two-way Reflect conversations as infrastructure — *SelfAssessmentPanel; 403 gate enforced in API; Reflect tracked in #26*
- [x] **Solve missing development plans** — every review must include a documented development plan with specific actions, timelines, and manager commitments (mandatory, not optional) — *DevelopmentPlanForm is a required step before finalization*
- [x] **Solve bell curve calibration** — use competency-anchored rating scales with behavioral descriptors; no forced distribution or normative curves — *5-point RATING_SCALE; no distribution enforcement*

### Eight Research-Validated Practices Built In

- [!] **Continuous feedback embedded with formal reviews** — check-ins, Reflect conversations, and coaching logs all feed directly into the review — **PARTIAL: check-in summaries and performance notes are pulled; Reflect not yet built (#26); coaching C&A audit logs not specifically surfaced**
- [x] **Employee self-assessment completed first** — manager cannot begin their assessment until the employee has submitted theirs — *403 returned by `/api/grow/reviews/[id]` PATCH when selfAssessment.status !== "submitted"*
- [x] **Goal linkage to strategic priorities** — automatic via Strategy Studio alignment; reviews without explicit goal-to-strategy connections cannot be defended or used for talent planning — *startPerformanceReviewTool pulls aligned goals and strategy goals; foundation data included*
- [!] **Strengths-forward feedback approach** — dedicated Employee Strengths section in every review framework — **NOT IMPLEMENTED as dedicated section: no standalone Employee Strengths field in self-assessment or manager assessment forms (#52)**
- [!] **Competency-anchored rating scales** — five-point scale with clear behavioral definitions at each level (no numeric scales without anchors) — **PARTIAL: 5-point scale exists with labels/descriptions, but anchors are generic across all categories — not per-competency (#54)**
- [x] **Documented development plans attached to every review** — mandatory section, not optional add-on — *DevelopmentPlanForm required; review cannot be finalized without it*
- [x] **Manager as coach, not evaluator** — language of coaching, not judgment; review framed as a coaching conversation — *guided prompts use coaching-oriented language; "Notes" framing vs judgment language*
- [x] **Multi-source data in the preparation phase** — gather key achievements, performance metrics, attendance, peer/client feedback, and check-in notes before any review conversation — *evidence panel surfaces goals, check-ins, performance notes in ManagerAssessmentForm*

### Question Ownership

- [x] **HR owns the question framework** — questions are standardized frameworks developed by HR, grounded in the organization's competency model and strategic goals — *guided prompts hardcoded in `performance-review-categories.ts`, not user-authored*
- [x] **Managers do not write their own questions** — producing wildly inconsistent evaluation criteria, reinforcing bias, and making calibration across teams impossible
- [x] **Employees do not write their own questions** — creates selection bias toward areas where they feel confident
- [x] **Shared framework, both parties respond to same questions** — built by HR, delivered to both, employee completes portion first and independently — *same REVIEW_CATEGORY_KEYS used in both SelfAssessmentForm and ManagerAssessmentForm*
- [x] **Correct sequence enforced** — employee self-assessment opens first; manager cannot begin their assessment until the employee has submitted theirs; Reflect conversation surfaces and addresses gaps between self- and manager assessments — *403 gate enforced; Reflect step pending #26 and #57*

---

## Review Cadence: Three-Tier Model

- [!] **Ongoing check-ins every two weeks** — continuous feedback cadence feeding into formal reviews — **PARTIAL: Check-ins module exists and data feeds review evidence; no cadence enforcement or "2-week" guardrail**
- [!] **Formal mid-year review** — assesses goal progress and adjusts development priorities — **PARTIAL: `mid_year` in REVIEW_TYPES schema; period selector shows H1/H2 but not "mid_year" label explicitly**
- [x] **Annual review** — venue for compensation decisions, formal promotion considerations, year-over-year development progress, and organizational talent calibration — *"annual" option in period selector*
- [!] **90-Day review for new hires** — precedes the cycle and establishes baseline; retention and alignment tool (not a rating event); verifies role fit, addresses gaps in onboarding before they become habits, establishes manager-employee relationship foundation, confirms goal alignment, and documents early development needs — **PARTIAL: `ninety_day` in REVIEW_TYPES schema but not exposed in period selector UI; auto-trigger for new hires tracked in #46**
- [x] **Guardrail: no employee goes more than 90 days without a structured, documented conversation about their performance and development** — *surfaced as `performance_conversation_overdue` alert on HR dashboard via `/api/dashboard/attention`; medium at 90d, high at 120d; counts completed check-ins, performance notes, and finalized reviews*

---

## Performance Review Process Flow (8 Steps + Reporting)

### Step 1 — Review Initiation

- [ ] **HR configures review cycle** — period, cadence, and participants — **NOT IMPLEMENTED in UI: ReviewCycle schema and API exist (`/api/grow/review-cycles`) but no HR-facing UI to create/manage cycles (#46)**
- [x] **System auto-pulls supporting data** — aligned goals, strategic pillar tags, department focus areas, check-in notes, Reflect summaries, and coaching logs — *`startPerformanceReviewTool` pulls goals, check-ins, performance notes, foundation data, strategy goals*

### Step 2 — Employee Self-Assessment (Completed First)

- [x] **Employee self-assessment opens first** — employee rates self across all review categories using guided prompts — *SelfAssessmentPanel shows employee their pending reviews; SelfAssessmentForm has all 10 categories*
- [!] **Goal completion, Reflect entries, and strategy alignment auto-populated** into the self-assessment — **PARTIAL: auto-population exists in v1 chat flow; v2 SelfAssessmentForm starts blank with no pre-populated goal data or Reflect entries**
- [ ] **Includes strengths narrative, development priorities, and support needs** — **NOT IMPLEMENTED: SelfAssessmentForm has only generic "Notes" and "Specific Examples" per category — no dedicated strengths narrative, development priorities, or "support needed from manager" fields (#52)**
- [x] **Self-assessment must be submitted before manager can begin** — hard gate — *API returns 403 if selfAssessment.status !== "submitted" when manager tries to save*

### Step 3 — Manager Assessment

- [x] **Manager must review employee's self-assessment before completing their own** — *employee's self-assessment sections shown as read-only reference panel in each CategorySectionCard*
- [x] **Manager rates across same categories** using competency-anchored 1-to-5 scale — *same REVIEW_CATEGORY_KEYS; LikertScale 1–5*
- [!] **Supporting documentation required** — check-in notes, coaching logs, metrics, goal data must accompany each rating — **PARTIAL: evidence panel present and evidence auto-surfaced; however submission is allowed with zero evidence tagged — no enforcement (#50)**

### Step 4 — AI-Assisted Review Drafting

- [!] **AI generates narrative review language** tied to strategic pillars and values — **PARTIAL: `generateReviewDraftTool` exists in v1 chat flow; v2 structured category flow has no AI narrative generation step (#55)**
- [ ] **Sidebar displays which strategic priorities the employee ladders to** during drafting — **NOT IMPLEMENTED in v2 flow: strategic priorities sidebar exists in v1 working doc only (#55)**

### Step 5 — Manager Finalizes Review

- [!] **Manager edits AI-drafted language** and adds specific examples and context — **PARTIAL: editing exists in v1 PerformanceReviewForm; v2 flow goes directly from manager assessment → dev plan with no narrative editing step (#55)**
- [!] **Manager confirms strategic alignment narrative** and attaches supporting documentation — **PARTIAL: strategic alignment field in v1 only; v2 dev plan has no strategic alignment confirmation (#55)**

### Step 6 — Reflect Conversation

- [ ] **Manager and employee discuss review in structured two-way dialogue** — **NOT IMPLEMENTED: Reflect module not yet built (#26); no Reflect step in review lifecycle (#57)**
- [x] **Self-assessment and manager ratings compared side-by-side** during the Reflect conversation — *AcknowledgmentView shows side-by-side comparison of all 10 categories for both assessments*

### Step 7 — Employee Acknowledgment

- [x] **Employee signs to confirm receipt** (agreement not required) — *AcknowledgmentView: "Sign Off →" button sets status to "acknowledged"; confirmation copy reads "confirms you have reviewed and understand this assessment"*
- [ ] **Option to add written response** from employee during acknowledgment — **NOT IMPLEMENTED: no textarea for employee written response in AcknowledgmentView (#49)**

### Step 8 — Development Plan and Next Period Goals

- [x] **Development plan with specific actions, timelines, and manager commitments** produced as part of review — *DevelopmentPlanForm: areas of improvement (area/actions/timeline/owner), manager commitments, next review date*
- [ ] **Goals carry forward or are newly created from strategic pillar context** for the next period — **NOT IMPLEMENTED: no goal creation/carry-forward step after review finalization (#56)**

### Alignment Reporting — Canopy / Vantage

- [ ] **Category averages, strategic alignment gaps, capability needs, and trend data** feed into HR analytics and leadership dashboards — **NOT IMPLEMENTED: tracked in #47**

---

## Five Core Review Sections

Every Ascenta performance review must contain these five structural sections:

- [!] **1. Goal Achievement and Strategic Alignment** — primary measurement section; goals connected to organizational strategic plan, team objectives, and employee job description; covers three goal types (job description goals = ongoing accountabilities, project goals = time-bound objectives, behavioral goals = how work is accomplished); documents goal progress, names aiding/impeding factors, and establishes new goals for next period — **PARTIAL: goals pulled in v1 flow; v2 category forms have no dedicated Goal Achievement section; new goals for next period not built (#52)**
- [!] **2. Core Competencies by Role, Measured With Behavioral Anchors** — base competencies: quality of work, quantity of work, dependability, interpersonal skills, initiative, adaptability, decision-making; for supervisory roles add planning and organization, leadership, conflict resolution, team development; every competency rating supported by at least one specific behavioral example from the review period; rating scale uses behavioral definitions at each level (not numeric without anchors) — **PARTIAL: 10 categories cover these competencies; behavioral anchors are generic not per-competency (#54); evidence optional not required (#50)**
- [ ] **3. Employee Strengths and Documented Contributions** — dedicated section documenting what the employee did well, specific contributions exceeding expectations, recognition-worthy behaviors aligned to organizational values; captures the "how" behind the "what" (collaborative contributions, creative problem-solving, positive impact on culture); primary input to compensation and promotion decisions — **NOT IMPLEMENTED as dedicated section: no standalone strengths section in either self-assessment or manager assessment forms (#52)**
- [x] **4. Development Plan With Specific Actions and Manager Commitments** — mandatory section; includes areas showing improvement since last review, areas requiring attention with specific actions identified, on-the-job activities or outside programs that would build capability, and a timeline with accountabilities for both employee and manager — *DevelopmentPlanForm fully implements this with areas/actions/timeline/owner/manager commitments/next review date*
- [!] **5. Employee Self-Assessment and Formal Acknowledgment** — self-assessment asks employee to reflect on own goal progress, identify proudest accomplishments, name areas to improve, articulate development priorities for next period; review concludes with formal acknowledgment (signature confirms receipt, not agreement) — **PARTIAL: 10-category self-assessment and acknowledgment sign-off both exist; dedicated prompts for accomplishments/development priorities/support needs missing (#52)**

---

## Rating Scale (Five-Point, Competency-Anchored)

- [x] **Level 1 — Improvement Needed** — behavioral anchors defined per competency — *label + generic description exists in RATING_SCALE; per-competency anchors not yet defined (#54)*
- [x] **Level 2 — Developing** — behavioral anchors defined per competency — *same note as above*
- [x] **Level 3 — Meets Expectations** — behavioral anchors defined per competency — *same note as above*
- [x] **Level 4 — Exceeds Expectations** — behavioral anchors defined per competency — *same note as above*
- [x] **Level 5 — Exceptional** — behavioral anchors defined per competency — *same note as above*
- [x] **No forced distribution or bell curve calibration** — ratings are competency-anchored with behavioral descriptors at each level — *no distribution enforcement in code*
- [ ] **Overall rating calculated from category averages** — maps to the five-point scale — **NOT IMPLEMENTED: no aggregation or display of overall rating from category averages (#51)**

---

## Ten Review Categories

Each category contains dropdown subcategories, embedded competencies, and guided prompts for managers.

### 1. Job Knowledge and Technical Competence

- [x] **Definition** — ability to perform the role effectively using relevant skills, systems, and professional expertise — *shown in CategorySectionCard*
- [!] **Subcategories** — technical skills related to the job, industry knowledge and best practices, understanding of tools/systems/technology, application of professional expertise, accuracy of work product — **PARTIAL: data exists in `performance-review-categories.ts` but subcategories are not rendered in the form UI (#53)**
- [!] **Embedded competencies** — demonstrates strong understanding of job responsibilities; maintains knowledge of relevant tools, systems, and processes; applies technical skills effectively in daily work; maintains awareness of industry standards or best practices; uses technology and systems effectively — **PARTIAL: data exists but not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee understand the role and responsibilities?" / "Do they use required tools correctly?" / "Do they apply expertise to solve problems?" — *rendered as italic bullet list in CategorySectionCard*
- [!] **Competency alignment** — Business Acumen and Technical Expertise — **PARTIAL: not stored in current categories data structure; not shown in UI**

### 2. Quality of Work

- [x] **Definition** — produces accurate, thorough, and reliable work that meets organizational standards
- [!] **Subcategories** — accuracy and attention to detail, thoroughness and completeness, work standards and consistency, error prevention — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — accuracy and attention to detail; completeness and reliability of work; consistency of performance; adherence to professional standards; minimizes errors and rework — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee produce dependable work?" / "Do they maintain quality standards?" / "Do they complete tasks correctly the first time?"
- [x] **Legal defensibility note** — flagged as one of the most legally defensible review categories due to its objective, evidence-based nature — *noted in categories.ts comment*

### 3. Productivity and Time Management

- [x] **Definition** — manages workload effectively and completes responsibilities in a timely manner
- [!] **Subcategories** — work output, meeting deadlines, work prioritization, efficiency and workflow management, time management — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — meets deadlines and commitments; prioritizes work effectively; maintains appropriate work pace; demonstrates efficient use of time; manages workload independently — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee complete work within expected timeframes?" / "Do they manage competing priorities?" / "Do they use time productively?"
- [!] **Competency alignment** — Utilization and Performance Output — **PARTIAL: not stored or shown**

### 4. Communication

- [x] **Definition** — communicates information clearly, professionally, and effectively with others
- [!] **Subcategories** — verbal communication, written communication, listening skills, clarity of messaging, responsiveness — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — communicates clearly and respectfully; demonstrates strong listening skills; shares relevant information with stakeholders; writes professional and effective communications; responds appropriately and timely — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee communicate clearly?" / "Do they provide timely updates?" / "Do they maintain professional communication?"
- [!] **Competency alignment** — Communication — **PARTIAL: not stored or shown**

### 5. Collaboration and Interpersonal Effectiveness

- [x] **Definition** — works effectively with others and contributes positively to team success
- [!] **Subcategories** — team collaboration, respect and professionalism, relationship building, conflict resolution, stakeholder engagement — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — demonstrates respect for colleagues; contributes to team goals; builds positive working relationships; supports collaboration across teams; resolves disagreements professionally — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee contribute positively to the team?" / "Do they support coworkers?" / "Do they collaborate effectively?"
- [!] **Competency alignment** — Relationship Management and Consultation — **PARTIAL: not stored or shown**

### 6. Initiative and Problem Solving

- [x] **Definition** — demonstrates ownership of work and proactively addresses challenges
- [!] **Subcategories** — initiative and ownership, problem identification, decision making, continuous improvement, creativity and innovation — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — takes initiative to address challenges; identifies opportunities for improvement; uses sound judgment in decision making; demonstrates critical thinking; suggests innovative solutions — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee solve problems independently?" / "Do they contribute ideas?" / "Do they take ownership of outcomes?"
- [!] **Competency alignment** — Critical Evaluation and Leadership — **PARTIAL: not stored or shown**

### 7. Professionalism and Accountability

- [x] **Definition** — demonstrates reliability, integrity, and adherence to organizational standards
- [!] **Subcategories** — reliability and dependability, attendance and punctuality, ethical conduct, compliance with policies, responsibility for results — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — demonstrates dependability and reliability; maintains punctuality and attendance; accepts responsibility for outcomes; follows policies and procedures; demonstrates ethical behavior — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee behave professionally?" / "Do they follow policies?" / "Do they take accountability for work?"
- [!] **Competency alignment** — Ethical Practice and Policy Compliance — **PARTIAL: not stored or shown**

### 8. Leadership and Influence

- [x] **Definition** — demonstrates behaviors that positively influence others and contribute to organizational success (applicable to all employees, not just managers)
- [!] **Subcategories** — leadership potential, mentoring and coaching others, influencing positive outcomes, decision making, strategic thinking — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — demonstrates leadership behaviors; supports and mentors colleagues; encourages collaboration and engagement; demonstrates confidence in decision making; positively influences team culture — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee demonstrate leadership potential?" / "Do they support the growth of others?" / "Do they positively influence the team?"
- [!] **Competency alignment** — Leadership and Navigation — **PARTIAL: not stored or shown**

### 9. Learning and Development

- [x] **Definition** — demonstrates commitment to continuous improvement and professional growth
- [!] **Subcategories** — skill development, training completion, professional certifications, learning new responsibilities, career development effort — **PARTIAL: data exists, not rendered in UI (#53)**
- [!] **Embedded competencies** — participates in training or development opportunities; demonstrates willingness to learn new skills; applies new knowledge to work; seeks feedback and coaching; demonstrates adaptability to change — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee pursue growth opportunities?" / "Do they learn new skills?" / "Do they adapt to new expectations?"
- [!] **Competency alignment** — Continuous Learning and Talent Management — **PARTIAL: not stored or shown**

### 10. Culture and Values Alignment

- [x] **Definition** — demonstrates behaviors that align with the organization's mission, values, and culture; unique to each organization
- [!] **Subcategories (customizable per organization from Strategy Studio)** — integrity, respect, accountability, service orientation, team support — **PARTIAL: default subcategories exist; Strategy Studio customization not yet wired to this category at the form level (#53)**
- [!] **Embedded competencies** — demonstrates respect and integrity; treats others fairly and professionally; supports a positive workplace culture; demonstrates commitment to organizational values; contributes positively to the work environment — **PARTIAL: data exists, not rendered in UI (#53)**
- [x] **Guided prompts** — "Does the employee reflect company values in daily work?" / "Do they contribute positively to the culture?"
- [!] **Strategy Studio connection** — mission, vision, core values, and non-negotiable behaviors entered in Strategy Studio populate the subcategories and prompts here — **PARTIAL: foundation data (mission/values) pulled into review context in v1 flow; live subcategory population from Strategy Studio values not implemented**

---

## Nine Core Areas to Measure

The minimum set of dimensions necessary for a complete, defensible, and developmentally useful evaluation.

- [x] **A. Quality of Work** — does the employee complete work accurately, thoroughly, and to the required standard? Does output reflect attention to detail? Is rework required frequently or rarely? — *quality_of_work category*
- [x] **B. Quantity of Work and Productivity** — does the employee meet expected output targets? Does workload management reflect appropriate prioritization? Is volume consistent with role requirements? — *productivity category*
- [x] **C. Goal Achievement** — did the employee achieve goals established at the start of the review period? What percentage of goals were met, exceeded, or not met? What factors contributed to each outcome? — *covered via goals evidence; dedicated Goal Achievement section pending #52*
- [x] **D. Dependability** — how reliable is the employee in completing assignments, meeting deadlines, and being present? Do others depend on them with confidence? Is attendance and punctuality consistent? — *professionalism category*
- [x] **E. Interpersonal Skills and Teamwork** — does the employee work effectively with peers, supervisors, and direct reports? Do they share information, resolve conflicts, and contribute to a positive team environment? — *collaboration category*
- [x] **F. Initiative and Problem Solving** — does the employee work independently? Do they identify problems before being told? Do they look for more efficient or effective approaches to their work? — *initiative category*
- [x] **G. Adaptability** — is the employee able to adjust effectively to changing priorities, new information, or unexpected challenges? Do they remain productive through change? — *covered in learning_development and professionalism categories*
- [x] **H. Communication** — does the employee communicate clearly and appropriately in writing, verbally, and in listening? Are they effective at sharing information across levels and functions? — *communication category*
- [x] **I. Development and Growth** — has the employee made progress on their development plan since the last review? Have they pursued learning opportunities? Are they growing in their role? — *learning_development category + DevelopmentPlanForm*

---

## Five Principles for Effective Review Questions

Governing rules for how Ascenta builds guided prompts for every review category.

- [x] **1. Tie every question to measurable or observable behavior** — reference specific behaviors or outcomes, never character judgments; e.g., "Did the employee demonstrate initiative in identifying process improvements?" not "Is the employee a self-starter?"; questions must be answerable with evidence, not impression — *all guided prompts use behavioral language*
- [x] **2. Align questions to the job description and strategic goals** — review criteria align with each team member's job description and organizational goals; questions not connected to documented responsibilities cannot be used for compensation or disciplinary purposes; every question answerable in the context of the specific role — *categories align to job competencies; strategy goals pulled in*
- [!] **3. Use behavioral anchors for every rating level** — define what "meets expectations," "exceeds expectations," and "needs improvement" look like behaviorally for each competency; without anchors, different managers rate the same behavior differently — **PARTIAL: 5-point scale exists with generic labels; per-competency behavioral anchors not defined (#54)**
- [x] **4. Include forward-looking questions, not only backward-looking** — every review includes at least one question focused on the next period (e.g., "What are the major goals and accountabilities for the next review period?" / "What development actions would strengthen performance in the coming months?") — *DevelopmentPlanForm captures forward-looking actions; next-period goal creation pending #56*
- [!] **5. Build in two-way questions that invite employee voice** — at minimum, every review includes: "What support do you need from your manager in the next period?" and "What obstacles have made it harder to meet your goals?" — **PARTIAL: SelfAssessmentForm has Notes/Examples per category but no dedicated "support needed" or "obstacles" fields (#52)**

---

## Supporting Documentation Requirement

- [!] **Managers must provide evidence for each category rating** — no unsupported ratings allowed — **PARTIAL: evidence panel present and data auto-surfaced; submission is allowed without any evidence tagged (#50)**
- [x] **Evidence auto-surfaced from the Performance System** — check-in notes from ongoing conversations, coaching logs from Coaching and Corrective Action module, performance metrics tied to goal key results, and goal completion summaries from Goals module — *evidence endpoint `/api/grow/reviews/[id]/evidence` returns goals, check-ins, performance notes grouped and selectable*
- [x] **Legal defensibility** — evidence-based structure ensures ratings are grounded in observable, documented performance rather than recency bias or subjective impression — *evidence tagging persisted per category rating on review record*

---

## Cross-Module Connections Within Grow

- [x] **Goals** — completion data feeds review evidence — *`startPerformanceReviewTool` fetches employee goals for the period; evidence panel surfaces goals for manager tagging*
- [x] **Check-ins** — notes auto-populated as supporting evidence — *check-in summaries pulled in v1 tool; check-in records surfaced in evidence panel*
- [ ] **Reflect** — two-way summaries feed the review narrative — **NOT IMPLEMENTED: Reflect module not yet built (#26); not pulled into review context or evidence (#57)**
- [!] **Coaching and Corrective Action** — logs used as required documentation — **PARTIAL: PerformanceNote records pulled as evidence; formal coaching workflow audit logs from Corrective Action module not specifically surfaced**

### External Module Connections

- [x] **Strategy Studio (Foundation Layer)** — mission, vision, and values flow into the Culture and Values Alignment category and all guided prompts; strategic priorities and department focus areas populate goal alignment checks within the review — *foundation data (mission/values) and strategy goals pulled in startPerformanceReviewTool; live subcategory population from Strategy Studio values pending*
- [ ] **Leadership Library (Manager Guidance)** — evaluation guides, rating calibration resources, review writing best practices, strategic thinking guides, cascading conversation starters, and sample goal prompts available to managers — **NOT IMPLEMENTED: tracked in #26**
- [ ] **Learning and Development: Culture Gym** — development plans created from review outcomes and capability gaps identified in alignment reporting; shaped by company mission, vision, and values — **NOT IMPLEMENTED**
- [!] **Coaching and Corrective Action** — tied to goal and review outcomes; development plans aligned to strategic capability needs; coaching logs serve as required supporting documentation for review ratings — **PARTIAL: performance notes surfaced; formal C&A workflow logs not directly connected**

---

## Reference

### Research Data Points (used in-product rationale and HR education)

| Statistic | Context |
|---|---|
| 71% | of companies conduct reviews on annual-only basis despite insufficiency |
| 62% | of employees believe performance reviews are ineffective due to lack of clear feedback and follow-up |
| 210 hrs | average time managers spend per year preparing annual reviews |
| 60% | of HR professionals report managers lack data-driven insights for effective reviews |
| 60%+ | of a performance rating attributable to individual manager idiosyncrasies |
| 4.2x | organizations focused on employee performance outperform peers |
| ~30% | higher revenue growth in performance-focused organizations |
| 5 pts | lower attrition in performance-focused organizations |
| 39% / 44% | more effective at attracting / retaining talent with continuous feedback |
| 74% | of organizations have shifted to some form of ongoing feedback |
| 87% | of HR leaders say annual reviews alone are insufficient |
| 94% | of employees prefer real-time feedback |
| 14.9% | lower turnover rates with continuous feedback |
| 24% / 40% | outperformance and higher engagement with continuous feedback |
| 47% | of companies with regular reviews include self-appraisals |
| 91% / 14% | link individual goals to business priorities / confident it drives business value |
| 8.9% / 12.5% | more profitable / productive when feedback focuses on strengths |
| 31% | lower turnover when continuous feedback and development emphasized |
| 72% | of workers do not trust their organization's performance management process |
| 26% | of orgs believe their managers are highly effective at enabling performance |
| 54% | of executives rank coaching and mentoring first in what managers should strengthen |
| 3.6x | more engaged when new hires receive structured feedback in first 90 days |
| 69% | of employees more likely to stay three years with great onboarding |
| 12% | of employees believe employers do a great job with onboarding |
| 54% | of voluntary departures occur in first six months |
