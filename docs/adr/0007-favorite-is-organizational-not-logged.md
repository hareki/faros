# `favorite` is organizational state, not an activity-log event

Users want to flag a standout application — a strong JD fit, a company they'd love to work
for, or whatever they like. We model this as a plain mutable `boolean` column,
`applications.favorite` (NOT NULL, default `false`), surfaced as a star toggle on the board
card.

The question is whether toggling it should write to `activity_log`. It should not. `favorite`
is a subjective, freely-flipped organizational marker, not a pipeline milestone — it carries no
analytics meaning, and its history is uninteresting (a user starring and unstarring a card is
noise). Because `activity_log` is the single source of truth for analytics (ADR-0002), keeping
`favorite` off the log keeps the funnel/time-stats derivations clean and avoids a `type` that
would never be consumed.

## Decision

- `favorite` is current-state only on `applications`; the latest value is the whole truth.
- The future `toggleFavorite` server action is a **plain field update** — it does **not** call
  `logActivity()`, unlike the stage/sub-stage/close mutations.
- Creation backfill (ADR-0006) does **not** touch `favorite`; the column default covers it and
  there is no milestone to imply.
- It is excluded from Retro and the dashboard summary, which read only the activity log.

## Consequences

- Toggling favorite is cheap and side-effect-free; no migration of historical log rows is ever
  needed, and re-deriving analytics never has to account for it.
- If a future feature genuinely needs favorite *history* (e.g. "what did you star this week"),
  that is a new decision — revisit then rather than pre-logging now.
