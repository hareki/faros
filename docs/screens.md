# Screens

The high-level UI surfaces of Faros. Terminology follows `CONTEXT.md` (Stage, Sub-stage,
Tag, Resume, Activity, Event, Action needed, Reminder, Retro). Routes share a common
**app shell** described once below; auth routes use a separate minimal layout. Complex
modals, drawers, and dialogs that carry real logic are listed in their own section rather
than buried inside the route that hosts them.

Scope is V1 (see `high-level-design.md` § "V1 Feature Set"). Post-v1 surfaces (CSV import,
connected-accounts, AI chatbot) are noted at the end as deferred.

---

## App shell (shared chrome)

Every authenticated route renders inside one shell, so it is described here and not
repeated per route. The shell is a sidebar + header layout.

- **Header** (left → right): sidebar toggle, the **global Search** entry point, the
  notifications bell (in-app feed trigger), and the **account menu**.
  - **Global Search**: _scope TBD — to be defined in a later design pass._ Present as a
    placeholder in the shell; not a built V1 feature yet (see _Deferred_).
  - **Account menu**: signed-in user (name/avatar from OAuth profile), theme toggle, sign
    out.
- **Sidebar**:
  - Header: app logo / home link ("Faros").
  - Top: the **active Job Hunt switcher** — a dropdown showing the active hunt's name and
    listing the user's Job Hunts, marking the one active hunt, and linking ended hunts to
    their Retro. Entry point for "Start a hunt" / "End hunt". (See _Hunt switcher &
    lifecycle dialogs_ below.)
  - Nav: **Dashboard**, **Tracker Board**, **Resume Library**, and **Settings**
    (expandable → Sub-stages, Tags, Notification — a single Notification page with
    separate rules and preferences sections).
- **First-run shell state**: when the user has **no active hunt**, the shell collapses
  navigation that depends on a hunt and surfaces a single focused CTA ("Start your first
  hunt").

---

## Auth screens (public, minimal layout — no app shell)

### Sign In — `(auth)/sign-in`

Email + password form; Google and GitHub OAuth buttons; links to Sign Up and Forgot
Password. One account per email — OAuth auto-links to an existing verified email.

### Sign Up — `(auth)/sign-up`

Name + email + password form; same OAuth buttons. On submit, shows an **email
verification notice** state ("check your inbox"). Signing up with an already-registered
email is rejected as "email in use".

### Reset Password — `(auth)/reset-password`

Two states: (1) **request** — enter email to receive a reset link; (2) **reset form** —
set a new password from the emailed token. Also the path an OAuth-only account uses to
add a password credential.

### Email verification confirm — route

Landing target for the verification link; confirms the token and routes the user into the
app (or shows an expired/invalid token state).

---

## App routes (inside the shell)

### Dashboard — `(app)/dashboard`

The workflow-driver home for the active hunt.

- **Action needed** panel: condition-based prompts surfaced from unread `condition`
  notifications (e.g. "Applied 14 days, possibly ghosted"). Each item links to the
  application.
- **Upcoming events** panel: next interviews / take-home & offer deadlines across the
  active hunt, time-ordered (reuses the events-list component).
- **Hunt summary**: quick analytics for the active hunt — count per Stage, response rate,
  days active.
- **First-run / empty state**: when the active hunt has no applications, a focused CTA to
  add the first application.

### Tracker Board (Kanban) — board route

The action-oriented board for the active hunt.

- Four fixed **Stage** columns: **Applied** (waiting on them), **Active** (interviewing),
  **Final Stages** (offer pending / post-onsite), **Closed** (rejected / withdrawn /
  accepted / ghosted).
- **Cards**: company, role, Sub-stage chip (Active & Final Stages only), Tag chips,
  source icon.
- **Drag & drop** (dnd-kit) between columns writes a `stage_change` Activity and clears
  the Sub-stage; dropping into **Closed** opens the Closed-outcome prompt.
- **Filter bar**: filter by Tag, Sub-stage, source, working model — state lives in the URL
  query string (nuqs) so a filtered view is shareable/bookmarkable and survives refresh.
- **Quick-add application** entry point.
- Per-column empty states.

### Resume Library — resumes route

Manages **library**-scope Resumes (the reusable ones in the picker).

- List of library resumes: name, file metadata (size/type), upload date.
- Upload a new library resume (PDF, size-capped → Vercel Blob).
- Delete (soft delete — keeps attribution for Retro resume-performance).
- Application-scoped one-offs do **not** appear here; they are promoted in from the
  application drawer.

### Settings — settings route(s)

User-level configuration, likely tabbed/sectioned:

- **Sub-stages**: CRUD per Stage, restricted to **Active** and **Final Stages**;
  drag-reorder (dnd-kit) sets `sort_order`.
- **Tags**: CRUD of free-form filter Tags (name + color).
- **Notification rules**: CRUD over `notification_rules` — both **Action needed**
  (condition) and **Reminder** (time-based) rules; enable/disable each.
- **Notification preferences**: `user_notification_prefs` — in-app toggle, email digest
  on/off + cadence (daily/weekly), quiet hours, timezone.

### Retro — per ended hunt

The self-improvement review for an ended hunt (reached from the hunt switcher; read-only).

- **Funnel** (Recharts): Applied → first response → first interview → final round → offer,
  with counts and conversion rates (milestones derived from the activity log/events).
- **Time stats**: median days to first response, apply-to-offer, total hunt length.
- **Source breakdown**: response rate per source (LinkedIn, ITviec, referral, direct,
  recruiter, other).
- **Resume performance**: response rate per library Resume; one-offs bucketed as "Custom".
- **Outcome summary** cards: offers received, accepted, ghosted, withdrawn.
- Ended hunts are **read-only** — the Retro is a review surface, not an editor.

---

## Complex modals, drawers & dialogs

These carry enough logic/state to warrant their own description and implementation, and
appear over the routes above.

### Application Detail Drawer

Opened from any board card; the primary editing surface for one application.

- All metadata: company, role, source, JD url / JD text, location, working model, salary
  range, notes.
- **Sub-stage** picker (writes `sub_stage_change` Activity).
- **Tag** assignment.
- **Notes** via Lexical (basic formatting: bold/italic/underline/bullets).
- **Resume slot**: pick a library Resume, or upload an application-scoped one-off, or
  promote a one-off to the library.
- **Events list + event form** slot (see below).
- **Activity log timeline**: chronological Activities (created, stage/sub-stage changes,
  response/offer received, notes, events, closed).

### Quick-add Application dialog

Minimal create form — only required fields (company, role); drops into Applied. Optional
metadata can be filled later in the drawer. Reachable from the board and the dashboard
empty state.

### Close-outcome prompt

Triggered when an application enters **Closed** (drag-drop or action). Forces a
`closed_outcome` choice — rejected / withdrawn / accepted / ghosted — and stamps
`closed_at`. `ghosted` is only ever user-set.

### Event form

Create/edit an Event inside the drawer: type (HR screen, tech screen, onsite, take-home
due, offer deadline, other), scheduled time, duration, location/link, notes; plus
complete/cancel actions. Creating an `offer_deadline` event auto-logs `offer_received`.

### Hunt switcher & lifecycle dialogs

- **Start hunt** dialog (name the hunt; blocked if one is already active — friendly
  conflict message).
- **End hunt** confirmation (makes it read-only, unlocks its Retro).
- **Rename hunt** dialog.

### Resume picker dialog

Library-scope picker surfaced from the application drawer's Resume slot; plus the
application-scoped upload and the promote-to-library action.

### Notifications feed (in-app)

Header-bell dropdown listing recent notifications (both streams). Per-item mark-read /
snooze / dismiss. Unread count badge on the bell.

---

## Deferred (post-v1, not built in V1)

- **Connected accounts**: logged-in view to link/unlink Google & GitHub and set a
  password (linking-by-verified-email already works at sign-in).
- **CSV import** screen.
- **AI chatbot** to analyze hunt progress (`docs/roadmap.md`).
- Rich-text JD editor, browser extension, mobile-native app, multi-user/sharing.
- **Global Search**: present as a header placeholder; its scope (what it searches, where
  results land) is deferred to a later design pass and not part of the V1 feature set.
