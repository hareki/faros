# Applications may enter the board in any stage; creation backfills implied milestones

Applications normally start in **Applied** and advance rightward, but a user migrating from
another tracker already has applications mid-pipeline, and the board's per-column quick-add drops
a new application straight into **Active**, **Final Stages**, or **Closed** (the `+` on each
column prefills that column's Stage; still editable). The schema already permits this — no CHECK
blocks `active`/`final_stages`, a null `sub_stage_id` is legal in any Stage (ADR-0001), and
`closed` only requires `closed_outcome` + `closed_at` (the `applications_closed_state` CHECK).

The risk is analytics, not storage. Because `activity_log` is the single source of truth for
analytics (ADR-0002), _first response_ is derived from the earliest `response_received` activity,
which the normal path writes as a side effect of leaving Applied — `recordStageChange` auto-derives
it only when `from === 'applied'`, and `recordClose` derives response/offer from the closing
outcome. An application **created** past Applied skips those transitions, so without intervention
it carries no `response_received` and vanishes from the retro funnel's response step.

## Decision

`createApplication` owns the backfill. When the initial Stage is not Applied it writes the
milestones the equivalent Applied→advance path would have:

- **active / final_stages** → ensure a `response_received` (the company engaged), mirroring
  `recordStageChange`'s advance-out-of-Applied rule.
- **closed** → go through the close path so the outcome's implications hold (`rejected` ⇒ a
  response, `accepted` ⇒ an offer; `withdrawn`/`ghosted` ⇒ neither). Closed creation therefore must
  also capture a `closed_outcome`, which the quick-add collects.
- Always log the `created` activity.

`recordStageChange` is left unchanged — it models user-driven moves; backfill-on-creation is
`createApplication`'s responsibility, which keeps the "advance out of Applied" rule honest.

## Consequences

- The funnel and time-stats stay correct for migrated/backdated applications without
  denormalizing milestone timestamps onto `applications` (ADR-0002 preserved).
- The Closed column's quick-add needs an outcome field, unlike the minimal company+role add for
  the other three columns.
- The dev seed (`app/db/seed.ts`), which inserts non-applied apps with hand-written activity rows,
  should mirror this backfill so seeded data is funnel-consistent.
