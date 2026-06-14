# High-Level Design of Faros - Job Application Tracker

## Overview

A full-stack Next.js app for tracking job applications.

The app's **primary lens is workflow driver**: it surfaces what the user needs to act on next. A strong **secondary lens is self-improvement**: it uses past hunt data to help the user refine their approach over time. It is explicitly _not_ primarily a record-keeping app (a spreadsheet replacement).

## Core Concepts

### Job Hunt (first-class entity)

- Groups applications into a session (e.g., "2026 Senior FE Hunt").
- Only **one hunt active at a time**.
- Manually started and ended by the user. No automation around hunt lifecycle.
- **Read-only after ending**: an ended hunt is immutable. (A future enhancement may allow
  editing a few simple text fields to fix typos, but ending is otherwise final.)
- Each ended hunt has a Retro view.

### Application

- Belongs to exactly one Job Hunt.
- **Minimal required fields**; rich set of optional metadata the user can fill in if they want.
- Tracks position on the board (column) and current sub-stage (tag).
- Has an activity log.

### Resume

- First-class entity, not just a file attached to an application.
- Two scopes:
  - **Library**: reusable across applications, appears in the resume picker.
  - **Application-scoped**: one-off, tailored to a specific JD, does not pollute the picker.
- Users can promote a one-off resume to the library if they realize they want to reuse it.

### Event (future-dated)

- Interviews, onsites, take-home deadlines.
- Linked to an application.
- Drives time-based reminders.

### Activity Log Entry

- Records what happened (status change, note added, response received).
- Timestamped, optionally annotated.
- **Single source of truth** for analytics, the dashboard summary, and the notification
  condition engine. No denormalized milestone columns — milestones are derived from the
  log (see [ADR-0002](adr/0002-activity-log-single-source-of-truth.md)).
- Two signals are load-bearing for the funnel and notifications:
  - `response_received` — auto-logged once the first time an application advances out of
    Applied (→ Active/Final) or is closed as `rejected`; never for `ghosted`. A manual
    "log a response" action covers a recruiter acknowledgement while still in Applied.
    The 14-day idle/ghost clock and source/resume response-rate read this.
  - `offer_received` — auto-logged when an `offer_deadline` event is created or when
    closing as `accepted` (backfilled if missing); also settable manually.

## Screens

### Dashboard

- **Action needed** panel: condition-based prompts (stale applications, follow-up suggestions).
- **Upcoming events**: time-based view of interviews and deadlines.
- Quick analytics summary for the active hunt.

### Tracker Board (Kanban)

Fixed, **action-oriented** columns:

- **Applied**: waiting on them.
- **Active**: actively interviewing (any sub-stage).
- **Final Stages**: offer pending, post-onsite waiting.
- **Closed**: rejected, withdrawn, accepted, or ghosted.

`ghosted` is a terminal `closed_outcome` the **user** sets when closing an application
that never received a response. The system never auto-closes: the "possibly ghosted
after 14 days" notification only nudges; the user decides whether to close as ghosted or
keep waiting. By definition a ghosted application has no recorded response.

Sub-stages exist only for **Active** and **Final Stages**. **Applied** is a single
waiting state and **Closed** is sub-classified by its outcome, so neither offers
sub-stages. Moving a card between columns clears its sub-stage.

Each card has a **configurable sub-stage tag** (HR screen, tech screen, onsite, etc.) indicating exact pipeline position within the column. Cards can also have additional tags/labels for filtering (frontend, remote, startup, etc.).

### Retro View (per ended hunt)

- **Funnel**: Applied → first response → first interview → final round → offer. Both counts and conversion rates. Each milestone is derived from the activity log and events, never from current board state alone:
  - _first response_ → earliest `response_received` activity.
  - _first interview_ → earliest interview-type event (`hr_screen`/`tech_screen`/`onsite`) by `scheduled_at`; counts the invite even if later cancelled.
  - _final round_ → first `stage_change` into `final_stages`.
  - _offer received_ → earliest `offer_received` activity (offers received ≥ accepted, since declined/expired offers still count).
- **Time stats**: median days to first response, apply-to-offer, total hunt length.
- **Source breakdown**: response rate by source (LinkedIn, referral, direct, recruiter outreach).
- **Resume performance**: response rate per library resume. One-offs bucketed as "Custom" since sample size of 1 is noise.
- **Outcome summary**: offers received, accepted, ghosted, withdrawn counts.

The retro is for behavior change, not pretty charts. Source breakdown and resume performance are the metrics most likely to influence the next hunt.

## Notification System

Two conceptual streams, **one shared engine and delivery layer**.

### Action Needed (condition-based)

- Triggered by conditions on application state.
- Example: "status = Applied AND no activity for 14 days → surface as possibly ghosted."
- Powers the dashboard's action-needed panel.
- All conditions are configurable per user.

### Reminders (time-based)

- Triggered by upcoming events.
- Examples: "3 days before scheduled interview", "1 day before take-home due".
- Powers upcoming events on the dashboard.
- All schedules are configurable per user.

### Shared Infrastructure

- Same rule engine evaluates both stream types.
- Same delivery channels: **in-app badges + optional email digest**.
- Same mute/snooze/preferences UI.
- Same digest format.

Two front doors, one engine room.

## Auth

- Email + password sign in/sign up.
- OAuth providers: Google, GitHub.
- **One account per email.** An email is a single user; password, Google, and GitHub are just different credentials on that one account — never separate accounts for the same address.
- **Adding a sign-in method:**
  - Provider → existing email: linked automatically on first sign-in when the provider reports the email as verified (Google and GitHub both do). Verified-email only — no forced/trusted-provider linking.
  - Password → OAuth-only account: the user runs the "Forgot password" flow to set a password (which creates the credential method). Plain email/password sign-up of an already-registered email is rejected as "email in use".
- **Planned (post-v1):** a logged-in **Connected-accounts** view to link/unlink Google & GitHub and set a password, backed by Better Auth's `linkSocial` / `unlinkAccount` / `listAccounts` / `setPassword`.

## V1 Feature Set

- Auth (email + OAuth); one account per email, providers auto-linked by verified email.
- Job Hunt CRUD; one active at a time.
- Application CRUD with minimal required fields and optional metadata.
- Kanban board with fixed columns + configurable sub-stage tags.
- Per-application activity log.
- Future event entities (interviews, deadlines) with time-based reminders.
- Resume library + application-scoped uploads, with promote-to-library action.
- Unified rule engine for action-needed conditions and time-based reminders.
- In-app notifications + email digest.
- Dashboard with action-needed panel and upcoming events.
- Empty/first-run state with focused CTA.
- Basic analytics summary for the active hunt.
- Retro view for ended hunts.

## Explicitly Deferred (post-v1)

- **CSV import**: no standardized format, guessing is unreliable.
- **Rich text JD editor**: external link is sufficient for v1; rich text copy-paste is nice-to-have for when JD posts get taken down.
- **Browser extension** for quick-add from job boards.
- **Mobile-native app**.
- **Multi-user / sharing**.
- File attachments beyond resumes (e.g., cover letter library).
- **Connected-accounts UI**: logged-in view to link/unlink OAuth providers and set a password. Linking by verified email already works at sign-in; this is the self-service management surface.

## Open / TBD (next design phases)

1. **Data model**: full entity list, relationships, key fields.
2. **Rule engine design**: structure of conditions, triggers, and actions.
3. **Tech stack**: Next.js routing strategy (App Router, server actions vs API routes), auth library, DB/ORM, file storage provider, email provider, background job runner.
