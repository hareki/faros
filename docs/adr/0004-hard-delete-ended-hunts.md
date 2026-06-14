# Hard-delete ended hunts; never the active hunt

Ended hunts can be permanently deleted so the switcher does not accumulate dead sessions
over time. Deletion is a hard `DELETE` on `job_hunts`, guarded by `status = 'ended'` so the
live active hunt can never be removed. It cascades through the `onDelete: 'cascade'` foreign
keys: every `application` in the hunt and its `application_tags` go with it.

This is deliberately destructive and irreversible — the deleted hunt's Retro and history are
gone for good. To make accidental deletion hard, the action is only reachable once an ended
hunt is the selected hunt, and confirming requires retyping the hunt's exact name (see
`ConfirmByNameDialogView`).

## Why it is safe for the rest of the data

- **Resumes survive.** Resumes are user-scoped, not hunt-scoped, and are soft-deleted (see
  [ADR-0003](0003-soft-delete-resumes.md)). Deleting a hunt removes the applications that
  referenced a resume, but the resume row and every _other_ hunt's attribution stay intact.
  Only the deleted hunt's own retro attribution disappears — which is the intent.
- **Sub-stages and tags survive.** They are user-owned configuration referenced by
  applications; the applications cascade away, the definitions remain.

## Consequences

- `job_hunts` has no `deleted_at` — hunt deletion is intentionally hard, unlike resumes. The
  asymmetry is the one ADR-0003 draws: a deleted hunt should leave the data set entirely; a
  deleted resume must not orphan its applications.
- The mutation's `status = 'ended'` predicate is load-bearing; without it the active hunt
  could be destroyed. The server action returns `errorCannotDeleteActiveJobHunt` on any
  non-match (active, already deleted, or not owned).
