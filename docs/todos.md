# V1 Todos

Build-order roadmap derived from `high-level-design.md`, `database.dbml`, and `tech-stack.md`. Grouped as **Foundation** (the flexible base everything sits on) then **Features** (dependency-ordered). Each item is tagged **[FE]** or **[BE]**. Within a feature the order follows: sketch static UI → build BE queries/server actions → wire FE to the real API. Mutations are **server actions**; the only HTTP routes are Better Auth handlers and Inngest functions.

## Foundation

### A. Tooling & dependencies

- [x] [FE] Install UI deps: shadcn CLI + base components, `lucide-react`, `clsx`, `tailwind-merge` (`cn` util)
- [x] [FE] Install form/validation deps: `react-hook-form`, `@hookform/resolvers`
- [x] [FE] Install client-state + interaction deps: `zustand`, `@dnd-kit/*`, `date-fns`, `sonner`, `recharts`, `lexical` + `@lexical/react`
- [x] [BE] Install backend deps: `drizzle-orm`, `drizzle-kit`, `drizzle-zod`, `@neondatabase/serverless`, `better-auth`, `resend`, `react-email`, `inngest`
- [x] [BE] Configure `t3-env` with server/client schemas and wire into `next.config.ts`

### B. Design system, theming & i18n

- [x] [FE] Integrate Catppuccin palette
- [x] [FE] Set up Tailwind v4 + shadcn theme tokens; create global `<ThemeProvider>` and Sonner `<Toaster>` in `app/layout.tsx`
- [x] [FE] Integrate i18n with `next-intl`

### C. Database layer

- [x] [BE] Translate `docs/database.dbml` into Drizzle schema modules under `app/db/schema/` (auth, job_hunt, application, resume, event, activity, notification)
- [x] [BE] Create Neon-backed db client singleton (`app/db/client.ts`)
- [x] [BE] Generate initial migration with `drizzle-kit`
- [x] [BE] Add DB-level constraints (expressed natively in Drizzle via `check()` + partial unique index):
  - Partial unique index `one_active_job_hunt_per_user` on `job_hunts(user_id) WHERE status = 'active'`
  - `CHECK` on `resumes` enforcing `(scope='library') <=> (application_id IS NULL)`
  - `CHECK` on `applications` enforcing `closed_outcome` and `closed_at` set iff `stage = 'closed'`
- [x] [BE] Dev seed script (one user, one active job_hunt, a handful of apps across stages, sample resumes/events)
- [x] [BE] Drizzle schemas with `drizzle-zod` for `applications`, `sub_stages`, `tags`, `application_tags`
- [ ] [BE] Domain-hardening schema amendments (from grill session; see `CONTEXT.md` + `docs/adr/`):
  - Composite `UNIQUE(id, stage)` on `sub_stages` + composite FK `applications(sub_stage_id, stage) → sub_stages(id, stage)` (ADR-0001)
  - Add `offer_received` to the `activity_type` enum
  - Add `deleted_at` to `resumes` (soft delete, ADR-0003)

### D. Auth

BE config → flows → FE pages; the data model is dictated by Better Auth, so config precedes UI.

- [x] [BE] Configure Better Auth with the table/field mappings shown in `database.dbml` header comment
- [x] [BE] Enable DB-backed sessions with a short-lived signed cookie cache (`cookieCache`, `strategy: 'compact'`); `version` bump = global revocation
- [x] [BE] Add Google + GitHub OAuth providers + Vercel env vars (provider blocks wired in `app/lib/auth`; pending real OAuth app credentials + Vercel env vars)
- [x] [BE] `requireUser()` helper for server actions and `getUser()` for RSC reads
- [x] [BE] Email verification flow (token write → email via Resend → confirm route)
- [x] [BE] Password reset flow (request → email → reset form)
- [x] [FE] React Email templates for verification + reset
- [x] [FE] Comprehensive, scalable client form system
- [x] [FE] Sign-in, sign-up (including email verification notice), and reset-password UI
- [x] [FE] Integrate OAuth/Sign In/Sign Up/Reset Password Flow
- [x] [FE/BE] Logger Service

### E. App shell

- [ ] [FE] App shell: header with nav + auth menu + active-hunt switcher slot

### F. Shared primitives (the flexible base features reuse)

- [ ] [BE] `logActivity()` helper — writes typed `activity_log` rows with `metadata` diff; invoked by every mutation. Activity log is the single source of truth for analytics (ADR-0002), so this is load-bearing. Must auto-write `response_received` (first advance out of Applied or close-as-rejected; never ghosted) and `offer_received` (offer_deadline event created or close-as-accepted; backfill), plus stamp `stage_change` for funnel milestones.
- [ ] [BE] Server-action result convention — typed success/error envelope consumable by RHF + toasts
- [ ] [FE] Form primitive: RHF + Zod resolver wiring + shared field components
- [ ] [FE] Toast convention: Sonner helper hook around the server-action result envelope
- [ ] [FE] Reusable empty-state component + per-segment Suspense/error-boundary layout conventions

## Features

Dependency-ordered. Each feature: sketch static UI → build BE → wire FE.

### 1. Job Hunt

- [ ] [FE] Sketch hunt switcher dropdown + first-run "Start your first hunt" empty state (static)
- [ ] [BE] Drizzle queries + server actions: `createHunt`, `endHunt`, `unarchiveHunt`, `renameHunt`
- [ ] [BE] Rely on partial unique index for "one active"; surface a friendly conflict result for the UI
- [ ] [FE] `<ActiveHuntProvider>` React Context exposing current hunt + setter
- [ ] [FE] Wire hunt switcher (lists hunts, marks active, links to ended-hunt retros)
- [ ] [FE] Wire first-run empty-state CTA

### 2. Applications & board

- [ ] [FE] Sketch board route: 4 fixed columns (Applied / Active / Final Stages / Closed) with static cards
- [ ] [FE] Sketch card: company, role, sub-stage chip, tag chips, source icon
- [ ] [FE] Sketch card detail drawer: all metadata, activity-log timeline, resume-picker slot, notes (Lexical), event-list slot
- [ ] [BE] Sub-stage CRUD per user per stage (settings screen)
- [ ] [BE] Tag CRUD per user
- [ ] [BE] Board read query (apps grouped by stage for the active hunt)
- [ ] [BE] Server actions: `createApplication`, `updateApplication`, `moveStage`, `setSubStage`, `setTags`, `closeApplication` (writes `closed_outcome` + `closed_at`); each calls `logActivity()`
- [ ] [FE] Wire board columns + cards to real data
- [ ] [FE] Wire card detail drawer (metadata, activity-log timeline, notes via Lexical)
- [ ] [FE] Sub-stage dropdown on card (writes `sub_stage_change` activity)
- [ ] [FE] Tag filter UI backed by a Zustand store
- [ ] [FE] dnd-kit: drag cards between columns (writes `stage_change`; opens closed-outcome prompt when dropping into Closed)
- [ ] [FE] dnd-kit: reorder sub-stages in settings

> Note: the drawer's resume-picker and event-list slots are wired when features 3 and 4 land.

### 3. Resumes

- [ ] [FE] Sketch resume library list + picker UI (static)
- [ ] [BE] Vercel Blob upload server action (PDF only, size cap, returns `file_url`)
- [ ] [BE] Resume queries + `delete` and promote-to-library server actions (`scope='library'`, `application_id=NULL`)
- [ ] [FE] Wire resume library list screen with delete
- [ ] [FE] Wire resume picker (scope=`library`) into the application drawer
- [ ] [FE] Application-scoped upload from drawer (scope=`application`, `application_id` set)
- [ ] [FE] Promote-to-library action UI

### 4. Events

- [ ] [FE] Sketch event form + upcoming-events list (static)
- [ ] [BE] Server actions: `createEvent`, `updateEvent`, `completeEvent`, `cancelEvent` (each calls `logActivity()`)
- [ ] [FE] Wire event form (type, scheduled_at, duration, location, notes) inside the application drawer
- [ ] [FE] Wire upcoming-events list component (reused on dashboard)

### 5. Notification engine

Lay the flexible schema/writer before rules, runners, and UI.

- [ ] [BE] Discriminated-union Zod schemas for `trigger_config` (`condition` vs `time_based`) and `action_config`
- [ ] [BE] Shared notification writer: builds deterministic `dedup_key`, upserts on `(user_id, dedup_key)` unique index
- [ ] [FE] Sketch rule-CRUD settings, in-app feed dropdown, and prefs screen (static)
- [ ] [BE] Rule-CRUD server actions; `user_notification_prefs` queries + actions; notification read/snooze/dismiss actions
- [ ] [BE] Inngest function: condition runner (cron) — scans applications, evaluates each enabled `condition` rule, calls the writer
- [ ] [BE] Inngest function: time-based runner (cron) — scans events, evaluates each enabled `time_based` rule
- [ ] [FE] Wire rule-CRUD UI in user settings
- [ ] [FE] Wire in-app feed: header badge + dropdown list with mark-read / snooze / dismiss
- [ ] [FE] Wire user notification preferences screen (`user_notification_prefs`)
- [ ] [BE] Inngest function: email digest dispatcher honoring cadence + quiet hours + timezone
- [ ] [FE] React Email digest template

### 6. Dashboard

- [ ] [FE] Sketch dashboard: action-needed panel, upcoming-events panel, hunt summary, empty state (static)
- [ ] [BE] Queries: recent `unread` notifications from `condition` rules; next N events across the active hunt; hunt summary (count per stage, response rate, days active)
- [ ] [FE] Wire action-needed panel
- [ ] [FE] Wire upcoming-events panel (reuses the events list component)
- [ ] [FE] Wire hunt summary
- [ ] [FE] First-run / empty state with focused CTA (link to "add application")

### 7. Retro view (ended hunts)

- [ ] [FE] Sketch retro view: funnel, time stats, source breakdown, resume performance, outcome cards, read-only toggle (static)
- [ ] [BE] Analytics queries: funnel counts/rates; median times (first response, apply-to-offer, hunt length); source breakdown w/ response rate; resume performance (one-offs bucketed as "Custom"); outcome counts
- [ ] [FE] Read-only mode toggle on ended hunts
- [ ] [FE] Wire funnel chart (Recharts): applied → first response → first interview → final round → offer
- [ ] [FE] Wire time-stats panel
- [ ] [FE] Wire source-breakdown chart (response rate per `application_source`)
- [ ] [FE] Wire resume-performance chart (response rate per library resume; one-offs bucketed as "Custom")
- [ ] [FE] Wire outcome summary cards (offers received / accepted / ghosted / withdrawn)
- [ ] [FE] Unarchive escape-hatch button (calls `unarchiveHunt` from feature 1)

## Cross-cutting polish (final pass)

- [ ] [FE] Audit: Sonner toasts on every server-action result (success + error) — apply the Foundation toast convention everywhere
- [ ] [FE] Audit: Suspense + error boundaries per route segment
- [ ] [FE] Audit: empty states for every list view (board columns, resumes, events, notifications)
- [ ] [FE] Keyboard shortcuts: quick-add application, board navigation
- [ ] [FE] Mobile breakpoint pass on board + dashboard
- [ ] [FE] Favicon + meta tags + opengraph image

## Explicitly deferred (post-v1)

- CSV import
- Rich-text JD editor (plain text + URL for now)
- Browser extension for quick-add
- Mobile-native app
- Multi-user / sharing
- File attachments beyond resumes
- AI chatbot to analyze progress (`docs/roadmap.md`)
