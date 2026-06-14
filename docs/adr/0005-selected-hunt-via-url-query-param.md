# The selected hunt lives in the `?job_hunt` URL query param

The app shell needs one **selected hunt** — active or ended — that stays consistent on every
route, including the hunt-independent ones (Resume Library, Settings). The selection lives in
the `?job_hunt=<id>` URL query param — the single source of truth. It is resolved by
`pickSelectedJobHunt`: the param's hunt if it belongs to the user, else the active hunt, else
the most-recent ended hunt, else none. Ownership is enforced by construction — resolution only
ever picks from the user's own hunt list (`listJobHunts`), so a foreign or garbage id simply
falls back.

## Why the URL instead of a cookie

- The selection is bookmarkable and shareable, and survives a hard reload as plain URL state —
  the same place Tracker Board _filters_ already live (nuqs).
- One source of truth: there is no cookie/URL pair that can drift out of sync.

## How it is resolved (the layout can't read search params)

Next layouts don't re-render on navigation, so they **cannot** read `searchParams`. The shell
lives in the app-group layout, so resolution is split:

- **Hunt-scoped pages** (`/dashboard`, `/retro`) read their own `searchParams`, resolve via
  `getSelectedJobHunt`, and **redirect to the canonical URL** — enforcing both the
  route⟷status guard (an ended selection belongs on Retro, an active one on Dashboard) and a
  tidy `?job_hunt=<id>` (settling a missing/stale/foreign id). Server-side, so no flicker and
  no JS needed.
- **The shell** (`ActiveHuntProvider`, a client component) resolves the selection from the
  param with nuqs and **canonicalizes** the URL for pages without a server resolver (Resume
  Library, Settings): when a hunt is selectable but the param is missing/stale it writes the
  resolved id back as a shallow `replace`; when the user has no hunts it strips the param.

Selecting, ending, or deleting a hunt is just a navigation to the target hunt's primary view
carrying its `?job_hunt` — no server action records the selection.

## Consequences

- Every shell link carries `?job_hunt=<id>` (`jobHuntHref`) so the selection is preserved across
  navigation, including to the hunt-independent pages. The hunt id is threaded through internal
  links — accepted in exchange for a single, shareable source of truth.
- A page with no/invalid `?job_hunt` settles to the canonical URL (server redirect on hunt
  pages, client `replace` elsewhere); only a user with zero hunts has no param at all.
- Hunt-scoped pages remain dynamic (they read `searchParams`).
