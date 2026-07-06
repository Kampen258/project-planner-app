# Sprint 2 Status - Discovery Persistence

**Last Updated**: 2026-07-06  
**Overall Completion**: ✅ Code complete — one manual step remains (apply DB migration, see Handoff)

---

## Sprint Goal
Make the New Agile discovery loop (Opportunities → Hypotheses → Experiments → Insights) actually work end-to-end: real database tables, a typed service layer, and components that load and save real data instead of mocks.

---

## Completed ✅

### Codebase cleanup
- Deleted 29 unreachable orphan files (14 `App-*.tsx` variants, debug/fixed/minimal page copies, 3 dead DeliveryFlow versions, NewAgileProjectPage) — 7,570 lines of dead code removed
- `App.tsx` debug state fixed: proper `NotFoundPage` on the `*` route, debug logs and TestPage removed

### Database schema (`add_discovery_system.sql`, in both migration trees)
- Five tables: `opportunities`, `hypotheses`, `experiments`, `insights`, `delivery_tasks`
- Idempotent DDL per the `add_okr_system.sql` conventions; indexes on all project/FK columns
- **Dev-mode RLS**: permissive `dev_allow_all_*` policies because the app uses mock auth (`auth.uid()` is NULL). `created_by` has no FK to `auth.users` for the same reason. TODO(auth-sprint) markers included.

### Types
- `Opportunity`/`OpportunityCreateRequest` reconciled with the modal form and schema (context fields added, scoring normalized to confidence 1-10 / effort S-M-L per USER_MANUAL.md)
- `project_id` added to all discovery entities; new `InsightCreateRequest`
- `database.types.ts`: five new tables hand-authored (**replace via `npm run db:generate-types` after applying the migration**); added the missing `Relationships: []` field to all 12 tables — its absence made supabase-js type every insert as `never` (root cause of dozens of long-standing type errors)

### Service layer (`newAgileService.ts`)
- Fixed `createExperiment` arity bug (projectId was landing in the userId parameter)
- New `createInsight`/`getInsights`; project filters on experiments and delivery tasks
- Fallback behavior: "table missing" (42P01) **and** network-unreachable both degrade to mock data / empty lists so the UI stays usable in dev

### Components
- `DiscoveryPipeline`: loads all three entity lists on mount, renders real cards (status badges, scoring chips), appends created entities to state
- `OpportunityModal`: form now matches the type; confidence is a 1-10 select, effort S/M/L
- New `InsightModal` (single-step capture); `DiscoveryLog` wired to load + create insights
- **Bug found & fixed during browser verification**: all three wizard modals auto-submitted when clicking "Next" into the final step (React morphed the same DOM button from type="button" to type="submit" mid-click). Fixed with distinct `key`s. This bug predates Sprint 2 — users could never actually complete a wizard.

### Verification (in-container, 2026-07-06)
- All Sprint 2 files pass `tsc -b` and eslint with zero errors; repo-wide type errors reduced **523 → 455**
- `npx vite build` green
- Browser test (Chromium, dev server): full 4-step opportunity wizard → card renders with the exact entered values; insight capture → card renders with tags/impact; zero console page errors
- Note: DB writes could not be tested in-container (network policy blocks Supabase) — the offline fallback path was exercised instead

---

## Handoff — one manual step on your machine 🔑

1. **Apply the migration**: open the Supabase SQL Editor and run `database/migrations/add_discovery_system.sql` (or `npm run supabase:migrate` if the CLI is linked)
2. Optionally regenerate types: `npm run db:generate-types` (replaces the hand-authored entries)
3. Verify: `npm run dev` → open a project → Discovery tab → create an opportunity → reload the page → **it should still be there** (that's persistence working)

---

## Known Issues / Notes
1. **Dev-mode RLS is permissive** — any client with the anon key can read/write discovery data. Acceptable for solo dev; must be tightened in the auth sprint (TODOs in the migration file).
2. `okrService.ts` still calls `supabase.auth.getUser()`, which fails under mock auth — OKR creation won't persist until the auth sprint (out of Sprint 2 scope).
3. Decisions tab remains a read-only mock shell (deferred to Sprint 3 by decision).
4. ~455 pre-existing type errors remain in legacy files (services, old pages) — `npm run build`'s tsc step still fails; `npx vite build` works.

---

## Suggested Sprint 3 candidates
1. Decisions persistence + creation modal (completes the last mock tab)
2. Delivery flow persistence (table already exists) + WIP limit enforcement
3. Auth sprint: re-enable Supabase auth, strict RLS, fix okrService
4. Flow Metrics Dashboard (Phase 4 of docs/IMPLEMENTATION_PLAN.md)
