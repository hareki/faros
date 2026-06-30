# Phase 2 - Applications & Board Completion - Design

**Date:** 2026-06-30
**Status:** Approved

## Problem

Phase 2 (Applications & board) is partially built: the schema, the board read query, and
the favorite toggle (BE action + optimistic FE) are done. The remaining work
(`docs/todos.md` L88–L99) is the bulk of the feature's behaviour - every application
mutation, sub-stage/tag CRUD, the settings screens, the application detail surface, and the
board's interactive layer (quick-add, filtering, drag-and-drop). This design covers all of
it as one cohesive spec, to be executed as a phased implementation plan.

### Scope

In scope (the remaining unchecked Phase 2 items):

- BE: `createApplication`, `updateApplication`, `moveStage`, `setSubStage`, `setTags`,
  `closeApplication` mutations + server actions, each routing through `logActivity`.
- BE: sub-stage CRUD (per user, per stage) and tag CRUD (per user).
- FE: Settings screens for sub-stages (CRUD + drag-reorder) and tags (CRUD).
- FE: Application detail as a **modal + full-page** surface (replaces the "drawer" wording).
- FE: board wiring of the interactive layer - quick-add, the filter bar, and drag-and-drop
  between columns with the close-outcome prompt.

Explicitly **not** in scope (deferred to features 3 and 4 per `docs/todos.md` L101): the
detail surface's **resume-picker** and **event-list** slots ship as static placeholders.

## Decisions

These resolve ambiguities the source docs (`docs/todos.md`, `docs/screens.md`, `docs/adr/`)
left open or in conflict.

### D1. Application detail is a modal + full-page surface (was "drawer")

The detail surface follows the "ClickUp" model, implemented with Next.js **parallel +
intercepting routes**:

- **Soft navigation** (clicking a board card) is intercepted and renders the detail in a
  **Dialog (modal)** over the board. The URL becomes
  `/tracker-board/[applicationId]?job_hunt=…` (bookmarkable).
- **Hard load / refresh** of that URL hits the real route segment, which renders the **same
  detail as a full page** inside the existing app shell (header + sidebar intact), with a
  **top-right close button** back to `/tracker-board`.
- Both segments are **Server Components** that server-fetch the detail and stream a
  **skeleton** (Suspense) while it loads - no spinner, no client-side read round-trip. The
  fetched data is passed as typed props into the client editing components, matching the
  codebase's RSC-fetch-then-props convention.

Recorded as **ADR-0008**. The word "drawer" is retired across the docs.

### D2. Board filtering is server-side and URL-driven (resolves todos L97 vs screens.md)

`docs/todos.md` L97 ("Tag filter backed by a Zustand store") conflicts with `docs/screens.md`
("filter by Tag, Sub-stage, source, working model - state in the URL via nuqs"). `screens.md`
is canonical (per `AGENTS.md`) and `nuqs` is already a dependency, so:

- The filter bar covers **four dimensions**: Tag, Sub-stage, Source, Working model.
- State lives in the **URL query string via `nuqs`** (shareable, bookmarkable, survives
  refresh).
- A single shared module defines the `nuqs` parsers, consumed **both** client-side (the
  filter bar via `useQueryStates`) and **server-side** (the board page via `nuqs`
  `createLoader`), so `getBoardApplications` applies the filters in SQL. One source of truth.
- `docs/todos.md` L97 is rewritten to match.

### D3. Activity-logging semantics

The activity log is the single source of truth for analytics (ADR-0002), so each mutation's
logging is precise:

- **`closeApplication`** writes a `closed` activity through the existing `recordClose`
  helper (which derives `response_received`/`offer_received` from the outcome). It does
  **not** also write `stage_change`. Consequently **`moveStage` rejects `to: 'closed'`**:
  closing is always `closeApplication`'s job.
- **`moveStage`** clears `sub_stage_id`, and when re-opening from Closed also clears
  `closed_outcome`/`closed_at`, then calls `recordStageChange` (which auto-derives the first
  `response_received` on `applied => active/final_stages`).
- **`setSubStage`** logs `sub_stage_change` with sub-stage **names** (not ids), matching the
  seed - so the timeline reads correctly even after a sub-stage is later renamed or deleted.
- **`setTags`** writes **no** activity (tags are filter-only/organizational, like
  `favorite`).
- **`updateApplication`** writes `note_added` **only on the empty => non-empty transition** of
  `notes` (mirrors the `ensure*` "only if none yet" pattern); other metadata edits are not
  milestones and log nothing.
- **`createApplication`** backfills per ADR-0006: always `created`; `active`/`final_stages`
  ⇒ `ensureResponseReceived('stage_advance')`; `closed` ⇒ `recordClose(outcome)`.

### D4. Ownership resolution

`createApplication` resolves the user's **active** hunt server-side via `getActiveJobHunt`
and never trusts a client-supplied `jobHuntId` - quick-add only exists on the active board
(ended hunts are read-only). All other application mutations scope by
`application => job_hunt => user` using the same subquery pattern as the existing `setFavorite`
mutation.

### D5. Notes are stored as serialized Lexical state

The Lexical editor (basic formatting: bold/italic/underline/bullets, per `screens.md`)
serializes its `EditorState` to **JSON stored in the existing `notes` text column**. No
schema change; round-trips formatting; `notes` is not read as plaintext anywhere.

## Build phases

Ordered for stability and cohesion: both BE phases first (core lifecycle, then supporting
CRUD), then FE in dependency order (settings validates the CRUD end-to-end; detail consumes
the same sub-stage/tag data; board drag-and-drop is added last so it integrates with the
already-built click-to-open detail on the same card).

### Phase 1 - BE: application mutations + server actions

Files: `src/features/application/db/mutations.ts` (extend), `src/features/application/actions/*`,
`src/features/application/actions/types.ts` (extend), `src/db/seed.ts` (reconcile).

Mutations - `server-only`, take a `DbExecutor`, transactional so the state change and its
activity rows commit together:

- `createApplication` - insert + ADR-0006 backfill (D3). Closed creation sets
  `closedOutcome`/`closedAt` to satisfy the `applications_closed_state` CHECK.
- `updateApplication` - owner-scoped update of editable metadata (company, role, source,
  jdUrl, jdText, location, workingModel, salary min/max/currency, notes); `note_added` on the
  empty=>non-empty notes transition (D3). Returns updated row or `undefined`.
- `moveStage` - owner-scoped; reads current stage for `from`, clears sub-stage (and closed
  fields when re-opening), `recordStageChange`. Rejects `to: 'closed'` (D3).
- `setSubStage` - owner-scoped; validates the sub-stage belongs to the user and is valid for
  the application's current stage (the composite FK enforces stage-match at the DB level as a
  backstop); logs `sub_stage_change` with names. Accepts `null` to clear.
- `setTags` - owner-scoped; validates all tag ids belong to the user; replaces the
  `application_tags` set (delete + insert) in one transaction; no activity.
- `closeApplication` - owner-scoped; sets `stage='closed'`, `closedOutcome`, `closedAt=now`,
  clears sub-stage; `recordClose(outcome)`.

Server actions - `createServerAction({ schema, handler })` + `requireUser`, running the
mutation inside `db.transaction`, returning `ApplicationActionResult`:

- `createApplicationAction` (resolves active hunt; schema requires `closedOutcome` iff
  `stage==='closed'`), `updateApplicationAction`, `moveStageAction`, `setSubStageAction`,
  `setTagsAction`, `closeApplicationAction`.

New error keys on `ApplicationErrorKey`: `errorNoActiveJobHunt`, `errorSubStageInvalid`,
`errorTagInvalid` (alongside the existing `errorApplicationNotFound`).

Seed reconciliation (ADR-0006 consequence): `src/db/seed.ts` builds its activity log through
the activity helpers (`recordStageChange`/`recordClose`/`ensureResponseReceived`) so the
seeded non-applied apps (the `active` app and the `closed`-rejected app) are
funnel-consistent.

### Phase 2 - BE: sub-stage & tag CRUD

Files: `src/features/application/db/queries.ts` (extend), `db/mutations.ts` (extend),
`actions/*`.

- Sub-stages: `listSubStages(userId)` (grouped/ordered by stage then `sortOrder`);
  `createSubStage`, `renameSubStage`, `deleteSubStage`, `reorderSubStages` (sets `sort_order`
  for a list within one stage). Restricted to `active`/`final_stages`. `UNIQUE(userId, stage,
  name)` violations mapped via `isUniqueViolation()` to a friendly key.
- Tags: `listTags(userId)`; `createTag`, `updateTag` (name + HEX color), `deleteTag`.
  `UNIQUE(userId, name)` mapped likewise.
- Actions + error keys (`errorSubStageNameTaken`, `errorSubStageNotFound`,
  `errorTagNameTaken`, `errorTagNotFound`).

### Phase 3 - FE: Settings screens

Files: `src/app/(app)/settings/sub-stages/page.tsx` + `settings/tags/page.tsx` (fill the
stubs), feature `views/`, `view-models/`, `components/`; new i18n `settings.subStages` /
`settings.tags` client namespaces.

- RSC pages fetch the lists and pass typed props to client views.
- Sub-stages view: two stage sections (Active, Final Stages), each a list with add / rename /
  delete and **drag-reorder** via `@dnd-kit/react` writing `sort_order` through
  `reorderSubStagesAction`. (Absorbs todo L99.)
- Tags view: list with name + color swatch; add / edit (name + color) / delete.

### Phase 4 - FE: Application detail (modal + full page)

Files under `src/app/(app)/tracker-board/`: `layout.tsx` (renders `children` + the `@modal`
slot), `@modal/default.tsx` (null), `@modal/(.)[applicationId]/page.tsx` (Dialog host),
`[applicationId]/page.tsx` (full-page host + close link), skeleton components. Feature:
`db/queries.ts` (`getApplicationDetail`), `views/ApplicationDetailView.tsx`, supporting
client components (metadata form, sub-stage picker, tag multi-select, Lexical notes editor,
activity timeline), `view-models/`; new i18n `applicationDetail` + `activity` client
namespaces.

- `getApplicationDetail(userId, applicationId)` - full application row + activity timeline
  (ordered by `occurredAt`) + the user's sub-stages and tags (for the pickers); `notFound()`
  when not owned/missing; flags **read-only** when the owning hunt is ended.
- `ApplicationDetailView` (client) - metadata form (`updateApplicationAction`), sub-stage
  Combobox shown only for `active`/`final_stages` (`setSubStageAction`), tag multi-select
  (`setTagsAction`), Lexical notes editor (`updateApplicationAction`), favorite toggle (reuse
  existing), activity-log timeline (rendered from `type` + `metadata`, localized). Resume +
  event-list slots are **static placeholders**. All editing disabled in read-only mode.
- Board cards become links to the detail URL; the existing favorite button keeps
  `stopPropagation`.

### Phase 5 - FE: Board interactions

Files: `src/app/(app)/tracker-board/page.tsx` (extend), feature `components/`/`views/`,
shared `nuqs` parser module, `db/queries.ts` (`getBoardApplications` gains filters); i18n
`trackerBoard.filters` + `quickAdd` + close-outcome strings.

- **Quick-add dialog**: per-column `+` prefills that column's stage (ADR-0006); the **Closed**
  column adds a required `closed_outcome` field. `createApplicationAction` =>
  `router.refresh()`. Also a board-level quick-add defaulting to Applied.
- **Filter bar** (D2): four dimensions, `nuqs` URL state, server-side filtering in
  `getBoardApplications`; options from the user's tags/sub-stages and the source/working-model
  enums (the board page fetches these alongside the applications).
- **Drag-and-drop** (`@dnd-kit/react`): optimistic move + `router.refresh()` (favorite
  pattern). Dropping into **Closed** opens the shared **Close-outcome prompt** (Dialog) =>
  `closeApplicationAction`; cancel reverts. Other drops => `moveStageAction`. Disabled for
  ended (read-only) hunts. The Close-outcome prompt is shared with the Closed-column quick-add
  and the detail's close action.

## Docs & ADRs

Per the project's "update docs with code" rule:

- **New ADR-0008** - application detail as an intercepting-route modal with a full-page
  fallback (records D1).
- **`docs/screens.md`** - rename "Application Detail Drawer" => "Application Detail (modal +
  full page)"; describe the dual behaviour; confirm the four-dimension `nuqs` filter bar.
- **`docs/todos.md`** - rewrite L97 (nuqs, four dimensions); rename "drawer" => "detail/modal"
  in L88/L95/L96; note L99 folded into the Settings phase.

## Testing

Vitest, co-located in `src/features/application/__tests__/`, run against the dedicated Neon
`test` branch (truncated between tests). Extend `mutations.test.ts` and `actions.test.ts` to
cover:

- `createApplication` backfill per initial stage (applied / active / final_stages / closed
  outcomes); Closed-state CHECK satisfied.
- `updateApplication` writes `note_added` once (empty=>non-empty only); metadata-only edits log
  nothing.
- `moveStage` clears sub-stage; auto-derives first response on `applied => active/final`;
  rejects `to: 'closed'`; clears closed fields on re-open.
- `setSubStage` stage-compatibility + ownership; `setTags` replace semantics + ownership;
  `closeApplication` outcome-implied response/offer derivations.
- Sub-stage / tag CRUD: uniqueness mapping, ownership isolation, reorder.
- Server-side board filtering across the four dimensions.

Ownership isolation (another user's row is untouched / yields the not-found key) is asserted
for every mutation, mirroring the existing `setFavorite` tests.
