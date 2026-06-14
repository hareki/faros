# The selected hunt is resolved from a cookie, not the URL

The app shell needs one **selected hunt** — active or ended — that stays consistent on every
route, including the hunt-independent ones (Resume Library, Settings) that carry no hunt id in
their URL. The selection lives in a `faros.selected_job_hunt` cookie and is resolved
server-side on every shell load (`pickSelectedJobHunt`): the cookie's hunt if it still exists,
else the active hunt, else the most-recent ended hunt, else none.

Selecting a hunt sets the cookie and navigates to that hunt's primary view (Dashboard for the
active hunt, Retro for an ended one). The hunt-scoped pages re-resolve the same selection
(`getSelectedJobHunt`) so a page and the shell never disagree.

## Why a cookie instead of the URL

- A URL-encoded selection (`/tracker-board/[jobHuntId]`, …) would be bookmarkable, but the
  switcher still has to show _something_ selected on Resume Library and Settings, which have
  no hunt segment — so a persisted selection is needed regardless.
- Cookie resolution matches the shell's existing pattern: everything is server-resolved and
  re-synced via `router.refresh()` / navigation. It avoids threading a hunt id through every
  internal link and keeps the route tree flat.
- Trade-off accepted: a specific ended hunt's Dashboard/Board/Retro is **not**
  per-hunt-bookmarkable. Board _filters_ remain URL state (nuqs) as before; only the hunt
  selection itself lives in the cookie.

## Consequences

- Hunt-scoped pages read `cookies()` and are therefore dynamic — already true of the
  authenticated shell, so no new constraint.
- A stale or foreign cookie id is harmless: the resolver only ever returns a hunt from the
  user's own list, so it silently falls back.
- Guards keep routes coherent with the selection: `/dashboard` redirects to `/retro` when the
  selected hunt is ended, and `/retro` redirects to `/dashboard` when it is active.
