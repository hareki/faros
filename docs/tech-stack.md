# Tech Stack

The libraries, services, and platforms used to build Faros. Each entry notes its role in the app. Deferred alternatives and the reasoning behind picks are recorded in the [Decision Log](#decision-log) at the bottom.

## Frontend

- **Router**: [Next.js](https://github.com/vercel/next.js/) App Router. Routing, server components, server actions.
- **UI Library**: [shadcn](https://github.com/shadcn-ui/ui). Copy-paste component primitives built on Radix. Ships with `lucide-react` (icons) and `clsx` + `tailwind-merge` (the `cn()` utility).
- **CSS Framework**: [TailwindCSS](https://tailwindcss.com/). Utility-first styling, paired with shadcn.
- **Forms**: [React Hook Form](https://github.com/react-hook-form/react-hook-form). Client-side form state and validation. Wired to Zod via `@hookform/resolvers`.
- **State Management**:
  - React Context for cross-cutting config (theme, current user, active job hunt) and for compound components (composition pattern, e.g. passing shared state between a parent and its sub-components without prop drilling).
  - [Zustand](https://github.com/pmndrs/zustand) for shared client state (board filters, drag state, modal state).
- **Drag and Drop**: [dnd-kit](https://github.com/clauderic/dnd-kit). Powers the Kanban board (cards between columns, sub-stage reordering).
- **Charts**: [Recharts](https://github.com/recharts/recharts). Retro view visualizations (funnel, conversion rates, source breakdown, resume performance).
- **Date Library**: [date-fns](https://github.com/date-fns/date-fns). Date formatting and math. Tree-shakeable, no Moment-style bundle bloat.
- **Toasts**: [Sonner](https://github.com/emilkowalski/sonner). User feedback for actions (saved, moved, deleted, error states).
- **Rich Text Editor**: [Lexical](https://lexical.dev/). Powers the notes-taking feature on applications. Basic formatting only (bold, italic, underline, bullet points).

## Validation

- **Schema Validation**: [Zod](https://github.com/colinhacks/zod). Shared between client (RHF resolver) and server (server action input parsing). Drizzle schemas are inferred into Zod via `drizzle-zod`.
- **Env Validation**: [t3-env](https://github.com/t3-oss/t3-env). Type-safe env vars validated at build time using Zod. Separates server-only from client-exposed (`NEXT_PUBLIC_*`) vars.

## Backend

- **Runtime**: [Next.js](https://github.com/vercel/next.js/) server actions and API routes.
  - Server actions for mutations triggered from React components.
  - API routes for auth handlers (Better Auth) and function endpoints (Inngest).
- **Database**: [Neon](https://neon.com/) serverless PostgreSQL. Scale-to-zero fits a bursty side-project traffic profile.
- **ORM**: [Drizzle ORM](https://github.com/drizzle-team/drizzle-orm). Type-safe SQL builder. `drizzle-kit` handles migrations.
- **Authentication**: [Better Auth](https://github.com/better-auth/better-auth). Email/password + Google + GitHub OAuth. Uses the Drizzle adapter so auth tables live in the same DB as app tables.
- **File Storage**: [Vercel Blob](https://vercel.com/docs/vercel-blob). Resume PDF uploads.
- **Email**: [Resend](https://resend.com/) for delivery, [React Email](https://react.email/) for templating. Used for transactional email (auth flows) and notification digests.
- **Cron / Background Jobs**: [Inngest](https://www.inngest.com/). Runs the notification rule engine: condition-based checks (e.g. "applied 14 days, no response") and time-based reminders (e.g. "interview in 3 days").

## Infrastructure

- **Deployment Platform**: [Vercel](https://vercel.com/). Hosts the Next.js app. Inngest functions deploy alongside it as standard API route handlers, so there is no separate worker runtime to manage.

## Decision Log

Alternatives considered and why they were not chosen.

### Zod vs ArkType

ArkType has excellent type-level performance and ergonomics, but its bundle size is too large for client-side use. Zod is the safer pick when schemas are shared across client and server.

### Neon + Better Auth vs Supabase

Supabase consolidates database, auth, and storage into a single service, which is appealing. The blocker is no scale-to-zero on the Postgres tier: Supabase keeps the DB running, while Neon idles to zero. For bursty side-project traffic, Neon's billing model is meaningfully better. Better Auth also gives more control over the user table shape than Supabase Auth, which owns its own `auth.users` schema.

### Inngest vs Trigger.dev

Both are solid choices for serverless background jobs. Inngest orchestrates and calls back to endpoints inside the Next.js app, so functions run on Vercel and the function code lives next to the rest of the codebase. Trigger.dev v3 runs code on its own workers, which means another runtime to think about. No hands-on experience with either; this is a research-based call leaning toward less infra to manage.

### Vercel Blob vs Cloudflare R2 vs Amazon S3

For resume PDFs the workload is tiny (a few MB per user, infrequently accessed), so the egress-cost advantage that usually favors R2 is irrelevant here. Vercel Blob has the easiest setup when already deploying on Vercel. Reconsider R2 if storage or bandwidth ever becomes meaningful.

### Lexical vs Tiptap

Tiptap ships more features out of the box (built on ProseMirror with a large extension ecosystem), but most of them are unused for the notes feature, which only needs basic bold, italic, underline, and bullet points. Lexical has a smaller core bundle, better runtime performance, and first-class React support via `@lexical/react` (it comes from Meta, same team as React). The tradeoff is more wiring up front for advanced features, which is acceptable given the simple feature set.
