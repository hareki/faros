# Soft-delete resumes to preserve retro attribution

Retro "resume performance" is response-rate per library resume, which depends on the
`applications.resume_id` linkage surviving. So resumes are soft-deleted via a
`deleted_at` column rather than hard-deleted: deleting a library resume removes it from
the picker but keeps the row and the FK intact, so historical attribution stays
accurate. The underlying Blob object may be purged; only the metadata row persists.

## Consequences

- This is an intentional asymmetry. Deleting an **application** hard-cascades its
  events, activity_log, application_tags, notifications, and application-scoped resumes
  (a deleted app should leave the funnel entirely), whereas a deleted **resume** must
  not orphan the applications that used it.
- `resumes` carries `deleted_at` while other entities do not — this ADR is why.
