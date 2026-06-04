# Sub-stage ↔ stage integrity via composite FK

An application carries both a `stage` and a `sub_stage_id`, and every sub-stage belongs
to exactly one stage — so the two can silently disagree (e.g. a `final_stages` card
pointing at an `active` sub-stage after a column move). We enforce consistency in the
database with a composite foreign key rather than relying on application code alone:
add `UNIQUE(id, stage)` on `sub_stages`, then FK `applications(sub_stage_id, stage) →
sub_stages(id, stage)`. A stage move sets `sub_stage_id = NULL` and the user re-picks a
sub-stage valid for the new column.

## Considered Options

- **App-only enforcement** (server actions guarantee consistency): less migration
  complexity, but every write path must stay disciplined forever and any direct/seed
  write can corrupt the invariant.
- **Composite FK (chosen)**: the DB rejects a cross-stage mismatch outright.

## Consequences

- `sub_stage_id` is nullable; with `MATCH SIMPLE` the FK is unchecked when it is NULL,
  so "no sub-stage" is legal in any column — including Applied and Closed, where
  sub-stages are not offered at all.
- Hard to reverse once application data exists, since dropping it would re-admit
  inconsistent rows.
