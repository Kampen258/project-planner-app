# ProjectFlow – Project Instructions (New Agile)

## Product Principles & Decision Guidelines

- **North Star:** Improve user activation and retention through fast, validated iterations.
- **Priorities:** Outcomes over output; small bets over big bets; flow over ceremony; evidence over opinions.
- **Decision Making:** Use hypotheses with success criteria; record rationale in a Decision Log; prefer reversible choices.
- **Planning Cadence:** Weekly discovery/testing; continuous delivery; monthly outcome reviews; quarterly OKRs.
- **Work Policies:** Limit WIP; visualize flow; unblock fast; measure cycle/lead time and outcome impact.

---

## Objectives & Metrics (OKRs)

**Objective:** Increase new‑user activation.

**Key Results:**
- Activation rate from 28% → 40%.
- First‑value time median from 9 min → 6 min.
- Onboarding drop‑off step‑2 from 35% → 20%.

**Operating Metrics:** Cycle time, lead time, throughput, aging WIP, escaped defects.

---

## Opportunity Backlog (Problem‑First)

- **Opportunity Format:** Problem statement, affected users, impact estimate, constraints.
- **Scoring:** Cost of delay, confidence, effort range (S/M/L), risk level.
- **Selection Rule:** Pull the next highest‑value, validated bet within WIP limits.

---

## Hypotheses & Experiments

- **Card Template Fields:** Objective, Problem, Hypothesis, Test Method, Target Metric, Success Criteria, Evidence links.
- **States:** Idea → In Test → Learning → Scale/Stop.
- **Kill/Scale Criteria:** Pre‑defined thresholds; stop fast when criteria aren't met; scale via delivery epics/tasks.

---

## Discovery Log

- **Artifacts:** User interviews, usability tests, analytics deep‑dives, prototype notes.
- **Insight Format:** Observation, interpretation, evidence source, confidence, recommended next step.
- **Linking:** Every delivery item references supporting discovery evidence.

---

## Delivery Flow (Kanban/Scrum‑Lite)

- **Columns:** Ready → In Progress → Review → Released → Measuring.
- **WIP Limits:** Per column; block moves when limits exceed; use expedite only for true urgencies.
- **Policies:** Definition of Ready/Done posted per column; peer review mandatory; measure outcomes post‑release.

---

## User Personas

### Starter
First‑time solo creator; needs clear onboarding, quick path to value, mobile‑friendly tasks.

### Switcher
Small business owner migrating from spreadsheets; needs import tools, simple automations, reliability.

### Operator
Team coordinator (3–15 people); needs permissions, shared dashboards, recurring workflows, status clarity.

### Advisor
External collaborator/client; needs read‑only or limited edit access, easy status views.

---

## Design System & Assets

- **Visual Language:** Color palette prioritizes accessibility (AA contrast), primary action color for key flows.
- **Typography:** Clear hierarchy (H1/H2/H3), system fonts for performance; consistent spacing scale.
- **Components:** Kanban board, card, metrics widgets, OKR panels, decision log, experiment tracker.
- **Interaction Rules:** Progressive disclosure; inline validation; accessible shortcuts; responsive layouts.

---

## Coding Conventions

- **Naming:** Intent‑revealing names; domain language (Opportunity, Hypothesis, Insight); no abbreviations.
- **Structure:** Modular domains; clear separation of discovery vs delivery modules; testable units.
- **Formatting:** Prettier + ESLint defaults; commit messages follow Conventional Commits; small PRs.
- **Testing:** Unit + integration for core flows; experiment toggles behind feature flags; telemetry events versioned.

---

## Security Practices

- **Data Protection:** Encrypt at rest/in transit; strict access controls; least privilege; audit logs for admin actions.
- **Privacy:** Minimize PII in logs; consent for analytics; configurable data retention.
- **Secrets:** Managed via vault; never in code; rotation policy enforced.
- **Threat Modeling:** Review for new components; security checklist before release.

---

## Compliance Requirements

- **Accessibility:** WCAG 2.2 AA for key flows (onboarding, boards, dashboards).
- **Privacy/Legal:** GDPR‑aligned data handling; clear DPA; user export/delete; cookie consent.
- **Records:** Maintain Decision Log and Experiment outcomes; keep audit trails of changes.

---

## External References

- Design system guidelines: [Link to design system]
- Analytics tracking plan: [Link to analytics docs]
- API documentation: [Link to API docs]
- Incident response runbook: [Link to runbook]
- Accessibility checklist: [Link to WCAG checklist]

---

## Operating Rituals (Minimal)

- **Weekly:** Discovery sync (learned, next tests), Flow health check (WIP, aging), Outcome spotlight.
- **Monthly:** Outcome review vs OKRs; prioritize next opportunities; retire non‑performing bets.
- **Continuous:** Demos focused on outcomes and learnings; Decision Log updates tied to releases.

---

## Roadmap: Problem‑First

- **Format:** Problem, target outcome, candidate bets, confidence, next test.
- **Policy:** No fixed feature lists; roadmap evolves from validated opportunities and outcome gaps.

---

## Tool Configuration (Notion Integration)

### Discovery Board
- **States:** Opportunities → Hypotheses → In Test → Learning → Archive
- **Custom Fields:** Objective/OKR, Problem, Hypothesis, Target Metric, Success Criteria, Evidence URL, Service Class, Cost of Delay

### Delivery Board
- **States:** Ready → In Progress → Review → Released → Measuring
- **WIP Limits:** Set per column; enforce via automation
- **Policies:** Definition of Ready/Done visible at each column

### Automations
- Move "In Test" → "Learning" at due date; prompt result capture
- Block column moves when WIP exceeds limits
- After "Released," auto‑create Measurement task due in X days

---

## Decision Log

- **Entry Template:** Decision, context, options considered, rationale, evidence, owner, date, links.
- **Scope:** Significant product changes, policy updates, experiment outcomes, risk acceptances.
- **Location:** Maintain as separate Notion database linked to relevant projects/experiments.

---

## Keep It Current

- Update OKRs quarterly
- Refresh personas biannually
- Retire outdated policies monthly
- Review WIP limits monthly
- Update external references as they change
- Archive completed experiments and learnings quarterly