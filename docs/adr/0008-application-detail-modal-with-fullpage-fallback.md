# Application detail is an intercepting-route modal with a full-page fallback

The application detail surface is the primary editing surface for one application. It must be
reachable from a board card without losing the board context, deep-linkable/bookmarkable, and
survive a refresh. A plain client-state drawer satisfies none of the URL requirements; a plain
route loses the board underneath.

## Decision

The detail is a Next.js parallel + intercepting route under `tracker-board/`:

- A `@modal` parallel slot hosts an intercepted route `(.)[applicationId]`. On client-side
  (soft) navigation from a board card, the detail renders in a Dialog **modal** over the board;
  the URL becomes `/tracker-board/[applicationId]` so it is bookmarkable.
- The real segment `tracker-board/[applicationId]/page.tsx` renders the same detail as a
  **full page** inside the app shell on a hard load or refresh, with a close control back to the
  board. `@modal/default.tsx` returns null so the slot is empty when no detail is active.
- Both segments are Server Components that fetch the detail (ownership-checked), the activity
  timeline, and the user's sub-stages/tags, then pass typed props to the client editing view.
  A Suspense boundary streams a skeleton while the fetch resolves (no spinner, no client-side
  read round-trip), consistent with the codebase's RSC-fetch-then-props convention.
- An ended hunt's detail is read-only (its board is already a frozen snapshot).

## Consequences

- The detail is shareable, refresh-safe, and closes on back-navigation for free.
- Adds a routing pattern (parallel + intercepting routes) not previously used in the codebase;
  the modal host and the full-page host share one `ApplicationDetail` server component and one
  client view, so there is a single editing implementation.
- The board page gains a `[applicationId]` child segment and a `@modal` slot; the board itself
  is unaffected on hard loads (the slot resolves to `default.tsx`).
