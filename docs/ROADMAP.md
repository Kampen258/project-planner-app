# Roadmap (July 2026)

Supersedes the sprint sequencing in IMPLEMENTATION_PLAN.md. Based on USER_MANUAL v1.1 + current build state.

- **Sprint 3 — Complete the Loop** ✅ (status transitions, decisions persistence, delivery board wiring, scale→task hand-off)
- **Sprint 4 — Auth & Security**: real Supabase auth in SimpleAuthContext, replace dev_allow_all_* RLS, fix okrService, roles groundwork
- **Sprint 5 — Flow Metrics & Automations**: flow_events + metrics engine, Flow Health Dashboard, WIP enforcement, aging alerts, experiment timer, measurement reminders, dynamic WIP
- **Sprint 6 — AI-Assisted Discovery**: insight synthesis from notes, AI-drafted hypotheses, scoring assist, provenance labels (reuse existing Claude services)
- **Continuous**: burn legacy type errors (450 left; goal: green `npm run build` by Sprint 5), introduce vitest with flowMetricsService, keep status docs current
