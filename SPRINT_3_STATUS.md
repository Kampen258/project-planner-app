# Sprint 3 Status - Complete the Loop

**Last Updated**: 2026-07-06
**Status**: ✅ Core loop complete (code); apply `database/migrations/add_decision_log.sql` on the live DB

## Done
- **Status transitions**: Discovery Pipeline cards now have interactive status selects (opportunity: backlog→researching→validated→archived; hypothesis: draft→…→scaled/killed; experiment: planned→…→completed) persisted via new `updateHypothesis`/`updateExperiment` service methods (+ `updateOpportunity` widened)
- **Discovery → delivery hand-off**: setting a completed experiment's decision to **scale** auto-creates a linked delivery task (`experiment_reference`, tagged `scaled-experiment`)
- **Decisions persistence**: `decisions` table (both migration trees), `DecisionCreateRequest`, service CRUD, new single-step `DecisionModal` per the manual's template, `DecisionLog` wired (was a console.log stub)
- **Delivery board wired**: `DeliveryFlowWorking` loads persisted `delivery_tasks` alongside legacy cards, WIP counts include them, and each has a move select (`updateDeliveryTask` stamps `started_at`/`completed_at` for future cycle-time metrics)

## Verified (in-container, offline fallback)
- Sprint 3 files pass tsc/eslint; repo errors 455 → 450; vite build green
- Browser: opportunity status transition, decision creation + card render, delivery board — zero page errors

## Handoff
Run `database/migrations/add_decision_log.sql` in the Supabase SQL Editor (discovery migration too if not yet applied).

## Deferred (known)
- Full `DeliveryFlowWorking` migration off the legacy Task type (5 legacy status-type errors remain, inventoried)
- Editing entity fields (only status/decision transitions shipped); pros/cons per decision option (creation captures option names only)
