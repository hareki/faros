# activity_log is the single source of truth for analytics

Retro funnel/time-stats, the dashboard active-hunt summary, and the notification
condition engine all need response/stage milestones. We derive these from the
`activity_log` (its `type`, `occurred_at`, and `metadata`) rather than denormalizing
milestone timestamps onto `applications`. One representation means no drift, and the log
preserves the full path of an application (a now-closed app still reveals it once passed
through Active/Final), which current board state cannot.

## Considered Options

- **Milestone timestamp columns** (`first_response_at`, `offer_at`, …) as a projection:
  cheaper, indexable reads — but a second representation that can drift from the log, and
  the read-cost it saves is negligible at side-project scale.
- **Current-state + events only**: simplest, but lossy — the funnel and median-to-
  interview break for applications that have already moved on.
- **activity_log only (chosen)**: drift-free and lossless; the only cost is jsonb-aware
  queries, which are cheap here.

## Consequences

- `logActivity()` correctness is load-bearing for analytics, not just an audit trail.
- Revisit (and only then consider milestone columns) if log-parsing ever becomes a real
  performance problem.
