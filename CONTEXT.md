# Faros

Faros is a job-application tracker whose primary lens is *workflow driver* (surface
what to act on next) and whose secondary lens is *self-improvement* (use past-hunt data
to refine the next hunt). This glossary fixes the language used across the codebase and
docs. It is a glossary only — no implementation detail.

## Hunts & applications

**Job Hunt**:
A session that groups applications (e.g. "2026 Senior FE Hunt"). Exactly one is active
at a time; manually started and ended.
_Avoid_: Search, campaign, session.

**Application**:
A single job application belonging to one Job Hunt. Carries a Stage, an optional
Sub-stage, optional Tags, and an Activity log.
_Avoid_: Job, posting, listing.

## Board vocabulary

**Stage**:
One of the four fixed board columns: Applied, Active, Final Stages, Closed. The
top-level position of an application.
_Avoid_: Column (in domain prose), status, phase.

**Sub-stage**:
The single, ordered, stage-bound pipeline chip on a card (HR screen, tech screen,
onsite). At most one per application, and only for the **Active** and **Final Stages**
stages. Cleared when the application moves to a different Stage.
_Avoid_: Tag, sub-stage tag, label, step.

**Tag**:
A free-form, user-owned filter label (frontend, remote, startup). Many per application;
used only for filtering the board.
_Avoid_: Label, sub-stage, category.

**Closed outcome**:
The terminal classification of a Closed application: rejected, withdrawn, accepted, or
ghosted. `ghosted` means closed having never received a Response; it is always set by
the user, never by the system.
_Avoid_: Result, status, disposition.

**Active** (disambiguation):
Two distinct senses — the *Active* board Stage (interviewing) and an *active* Job Hunt
(the one open session). Always qualify which is meant.

## Resumes

**Resume**:
A first-class CV entity, not a file attached to an application. **Library** resumes are
reusable and appear in the picker; **application-scoped** resumes are one-offs tied to a
single application and hidden from the picker. A one-off can be promoted to the library.
_Avoid_: CV (in identifiers), document, file, attachment.

## Activity & milestones

**Activity**:
A timestamped entry in the activity log recording what happened to an application
(created, stage change, response received, etc.). The activity log is the single source
of truth for analytics and milestones.
_Avoid_: Event (reserved — see below), history entry, audit row.

**Response**:
The first sign a company engaged with an application — an interview invite, an explicit
rejection, or a recruiter acknowledgement. Recorded as a `response_received` Activity.
The absence of any Response is what `ghosted` denotes.
_Avoid_: Reply, contact, callback.

**Funnel milestones**:
The ordered self-improvement checkpoints — first response → first interview → final
round → offer received. Each is derived from the activity log and/or events, never from
current board state alone.
_Avoid_: Steps, stages (Stage is reserved for board columns).

**Event**:
A future-dated, application-linked entity: interview, onsite, take-home deadline, offer
deadline. Drives time-based reminders.
_Avoid_: Activity (reserved), appointment, task.

## Notifications

**Action needed**:
Condition-based prompts derived from application state (e.g. idle 14 days). Powers the
dashboard's action-needed panel.
_Avoid_: Alert, warning.

**Reminder**:
Time-based notification derived from an upcoming Event (e.g. T-3 days before an
interview).
_Avoid_: Alert, nudge (informal only).

**Retro**:
The per-ended-hunt review: funnel, time stats, source breakdown, resume performance,
outcome summary. Its purpose is behaviour change, not record-keeping.
_Avoid_: Report, analytics dashboard, summary.
