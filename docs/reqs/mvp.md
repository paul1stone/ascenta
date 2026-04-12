# Ascenta MVP

> End-to-end employee lifecycle demo: Offer Letter through Performance Improvement

## Scenario

**Employee:** Brandon White
**Manager:** Katie Smith

Brandon White receives an offer letter, is onboarded through Ascenta's n8n-style Day One Readiness automation, and is introduced to the platform's daily tools. Working with his manager Katie Smith, Brandon creates goals for his 90-day check-ins aligned to the company strategic plan from Strategy Studio. Over the course of his tenure, Brandon encounters three incidents that result in a verbal corrective action, written warning, and PIP. The MVP demonstrates how Culture Gym improves behavior, and how Ascenta's structure helps the employee achieve the best version of themselves.

---

## MVP Pages and Features

### Plan

- [ ] **Strategy Studio** — company strategic plan visible; Foundation (mission, vision, values) and Strategic Priorities configured; role-based language translated so goals can align to pillars
  - Reqs: [strategy-studio.md](strategy-studio.md)

### Attract

- [ ] **Offer Letter** — Brandon White receives and accepts an offer letter through the platform

### Launch

- [ ] **Onboarding / Day One Readiness** — n8n-style automation workflow for onboarding; Brandon is guided through day-one tasks, introduced to Ascenta's daily tools and platform features

### Grow

- [ ] **Goals** — Brandon and Katie co-create 90-day goals; goals linked to Strategy Studio pillars; goal lifecycle (preparation, conversation, construction, activation, ongoing management)
  - Reqs: [goals.md](goals.md)

- [ ] **Check-Ins** — structured check-ins between Brandon and Katie; preparation, participation, and reflect phases; perception gap engine and loop mechanism
  - Reqs: [check-ins.md](check-ins.md)

- [ ] **Performance Reviews** — formal review leveraging goal data, check-in history, and alignment descriptors from strategic translation

- [ ] **Reflect** — two-way conversation tool for Brandon and Katie; conversation map, upward feedback, mutual commitments; triggered by check-in gaps or lifecycle milestones
  - Reqs: [reflect.md](reflect.md)

- [ ] **Culture Gym** — daily workout for Brandon (employee lane) and Katie (manager lane); skill-building that directly supports behavior improvement across incidents; streak and mastery tracking
  - Reqs: [culture-gym.md](culture-gym.md)

- [ ] **Leadership Library** — guided advice for Katie as manager; recognition language, coaching frameworks, developmental questions; MVV-aligned communication support

### Care

- [ ] **Verbal Corrective Action (Incident 1)** — first incident triggers verbal corrective action workflow; field collection, guardrails, document generation, audit trail

- [ ] **Written Warning (Incident 2)** — second incident triggers written warning workflow; document delivery pipeline (send, acknowledge, remind); tracked document in pipeline

- [ ] **Performance Improvement Plan (Incident 3)** — third incident triggers PIP workflow; structured improvement plan with milestones; demonstrates path to improvement

- [ ] **Improvement Status / Progress** — visible tracking of Brandon's improvement across incidents; Culture Gym data supports behavior change narrative; demonstrates Ascenta's structure leading to positive outcome

### Protect

- [ ] **Document Tracker** — Kanban pipeline showing all generated documents (verbal, written warning, PIP) and their delivery/acknowledgment status

- [ ] **Audit Trail** — immutable audit events for all corrective actions with SHA-256 hash chain

### Analytics

- [ ] **Canopy (HR Dashboard)** — aggregated signals: goal alignment, check-in health, Culture Gym participation, corrective action status

- [ ] **Vantage (Executive View)** — high-level organizational trend visibility
