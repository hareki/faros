# Faros

A job-application tracker built around one question — _what should I do next?_ — with a
second lens for learning from each finished hunt to run the next one better. It's a workflow
driver first, not a spreadsheet replacement.

**Live demo:** https://faros-iota.vercel.app

## Project status

Early days, and intentionally moving at a side-project pace. I'm not on this full-time. I'm
also studying AWS and DSA. I use Faros as a hands-on way to
practice and stretch across the whole stack: frontend, UI/UX, backend, and working
effectively with AI tooling. The priority is quality and learning depth over shipping speed

I started it while job-hunting, which put me on both sides at once — the developer and the
target user, a useful spot for discovering real needs and use cases instead of guessing at them.

On the design side, the UI draws heavy inspiration from the macOS design language and
[Resend](https://resend.com/)'s interface.

## What it does

- **Job Hunts** — group applications into one active session at a time; ended hunts stay reviewable.
- **Tracker Board** — a Kanban board with fixed, action-oriented columns (Applied => Active => Final Stages => Closed) and configurable sub-stages.
- **Resumes** — first-class CV entities: a reusable library plus one-off, application-scoped versions.
- **Activity log & Retro** — every change is logged and becomes the source of truth for a per-hunt retrospective (funnel, time stats, source and resume performance).
- **Notifications** — one rule engine driving both condition-based prompts ("idle 14 days") and time-based reminders ("interview in 3 days"), delivered in-app and by email digest.

## Tech stack

Next.js (App Router) · Neon Postgres + Drizzle ORM · Better Auth · TailwindCSS + shadcn ·
next-intl · Inngest · Resend · deployed on Vercel.

Full rationale and the alternatives considered live in [docs/tech-stack.md](docs/tech-stack.md).

## Docs

- [CONTEXT.md](CONTEXT.md): domain glossary; the vocabulary used across the app.
- [docs/high-level-design.md](docs/high-level-design.md): full product design and v1 scope.
- [docs/tech-stack.md](docs/tech-stack.md): stack choices and decision log.
- [docs/screens.md](docs/screens.md) — UI surfaces and screen breakdown.
- [docs/adr/](docs/adr/) — architecture decision records.
- [AGENTS.md](./AGENTS.md) — dev commands, conventions, etc.
