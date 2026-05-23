# V1 Todos

Build-order roadmap derived from `high-level-design.md`, `database.dbml`, and `tech-stack.md`. Top-level items are milestones; nested items are concrete sub-tasks.

## 1. Project foundation

- [x] Install UI deps: shadcn CLI + base components, `lucide-react`, `clsx`, `tailwind-merge` (`cn` util)
- [x] Integrate Catppuccin palette
- [ ] Install form/validation deps: `react-hook-form`, `zod`, `@hookform/resolvers`, `drizzle-zod`
- [ ] Install client-state + interaction deps: `zustand`, `@dnd-kit/*`, `date-fns`, `sonner`, `recharts`, `lexical` + `@lexical/react`
- [ ] Install backend deps: `drizzle-orm`, `drizzle-kit`, `@neondatabase/serverless`, `better-auth`, `resend`, `react-email`, `inngest`
- [ ] Configure `t3-env` with server/client schemas and wire into `next.config.ts`
- [ ] Set up Tailwind v4 + shadcn theme tokens; create global `<ThemeProvider>` and Sonner `<Toaster>` in `app/layout.tsx`
- [ ] App shell: header with nav + auth menu + active-hunt switcher slot

## 2. Database

- [ ] Translate `docs/database.dbml` into Drizzle schema modules under `db/schema/` (auth, hunt, application, resume, event, activity, notification)
- [ ] Create Neon-backed db client singleton (`db/client.ts`)
- [ ] Generate initial migration with `drizzle-kit`
- [ ] Add raw-SQL constraints not expressible in Drizzle:
  - Partial unique index `one_active_hunt_per_user` on `job_hunts(user_id) WHERE status = 'active'`
  - `CHECK` on `resumes` enforcing `(scope='library') <=> (application_id IS NULL)`
  - `CHECK` on `applications` enforcing `closed_outcome` and `closed_at` set iff `stage = 'closed'`
- [ ] Dev seed script (one user, one active hunt, a handful of apps across stages, sample resumes/events)

## 3. Auth

- [ ] Configure Better Auth with the table/field mappings shown in `database.dbml` header comment
- [ ] Enable stateless JWE cookie session (`cookieCache` strategy, no sessions table)
- [ ] Add Google + GitHub OAuth providers + Vercel env vars
- [ ] Sign-in, sign-up, and OAuth callback routes/pages
- [ ] `requireUser()` helper for server actions and `getUser()` for RSC reads
- [ ] Email verification flow (token write → email via Resend → confirm route)
- [ ] Password reset flow (request → email → reset form)
- [ ] React Email templates for verification + reset

## 4. Job Hunt

- [ ] Drizzle queries + server actions: `createHunt`, `endHunt`, `unarchiveHunt`, `renameHunt`
- [ ] Rely on partial unique index for "one active" + surface a friendly UI error on conflict
- [ ] `<ActiveHuntProvider>` React Context exposing current hunt + setter
- [ ] Hunt switcher dropdown in app shell (lists hunts, marks active, links to ended-hunt retros)
- [ ] First-run empty state: "Start your first hunt" CTA

## 5. Application core (data + mutations)

- [ ] Drizzle schemas with `drizzle-zod` for `applications`, `sub_stages`, `tags`, `application_tags`
- [ ] Server actions: `createApplication`, `updateApplication`, `moveStage`, `setSubStage`, `setTags`, `closeApplication` (writes `closed_outcome` + `closed_at`)
- [ ] `logActivity()` helper invoked by every mutation; writes typed `activity_log` rows with `metadata` diff
- [ ] Sub-stage CRUD per user per stage (settings screen)
- [ ] Tag CRUD per user

## 6. Kanban board

- [ ] Board route with 4 fixed columns (Applied / Active / Final Stages / Closed)
- [ ] Card component: company, role, sub-stage chip, tag chips, source icon
- [ ] Card detail drawer: all metadata, activity log timeline, resume picker, notes (Lexical), event list
- [ ] Sub-stage dropdown on card (writes `sub_stage_change` activity)
- [ ] Tag filter UI backed by Zustand store
- [ ] dnd-kit: drag cards between columns (writes `stage_change`; opens closed-outcome prompt when dropping into Closed)
- [ ] dnd-kit: reorder sub-stages in settings

## 7. Resumes

- [ ] Vercel Blob upload server action (PDF only, size cap, returns `file_url`)
- [ ] Resume library list screen with delete
- [ ] Resume picker (scope=`library`) used from application drawer
- [ ] Application-scoped upload from drawer (scope=`application`, `application_id` set)
- [ ] Promote-to-library action (`scope='library'`, `application_id=NULL`)

## 8. Events

- [ ] Server actions: `createEvent`, `updateEvent`, `completeEvent`, `cancelEvent` (each writes matching activity)
- [ ] Event form (type, scheduled_at, duration, location, notes) inside application drawer
- [ ] Upcoming events list component (used on dashboard)

## 9. Notification engine

- [ ] Discriminated-union Zod schemas for `trigger_config` (`condition` vs `time_based`) and `action_config`
- [ ] Rule CRUD UI in user settings
- [ ] Inngest function: condition runner (cron) — scans applications, evaluates each enabled `condition` rule, calls notification writer
- [ ] Inngest function: time-based runner (cron) — scans events, evaluates each enabled `time_based` rule
- [ ] Shared notification writer: builds deterministic `dedup_key`, upserts on `(user_id, dedup_key)` unique index
- [ ] In-app feed: header badge + dropdown list with mark-read / snooze / dismiss
- [ ] User notification preferences screen (`user_notification_prefs`)
- [ ] Inngest function: email digest dispatcher honoring cadence + quiet hours + timezone
- [ ] React Email digest template

## 10. Dashboard

- [ ] Action-needed panel reading recent `unread` notifications from `condition` rules
- [ ] Upcoming events panel (next N events across the active hunt)
- [ ] Hunt summary: count per stage, response rate, days active
- [ ] First-run / empty state with focused CTA (link to "add application")

## 11. Retro view (ended hunts)

- [ ] Read-only mode toggle on ended hunts
- [ ] Funnel chart: applied → first response → first interview → final round → offer (Recharts)
- [ ] Time stats: median days to first response, apply-to-offer, hunt length
- [ ] Source breakdown chart with response rate per `application_source`
- [ ] Resume performance: response rate per library resume; one-offs bucketed as "Custom"
- [ ] Outcome summary cards (offers received / accepted / ghosted / withdrawn)
- [ ] Unarchive escape hatch button

## 12. Cross-cutting polish

- [ ] Sonner toasts on every server-action result (success + error)
- [ ] Suspense boundaries + error boundaries per route segment
- [ ] Empty states for every list view (board columns, resumes, events, notifications)
- [ ] Keyboard shortcuts: quick-add application, board navigation
- [ ] Mobile breakpoint pass on board + dashboard
- [ ] Favicon + meta tags + opengraph image

## Explicitly deferred (post-v1)

- CSV import
- Rich-text JD editor (plain text + URL for now)
- Browser extension for quick-add
- Mobile-native app
- Multi-user / sharing
- File attachments beyond resumes
- AI chatbot to analyze progress (`docs/roadmap.md`)
