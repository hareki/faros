<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Commands

Run package.json scripts with `pnpm`, never `bun` (the scripts already shell out to `bun --bun` internally).

- `pnpm dev` — dev server. `pnpm inngest:dev` and `pnpm email:dev` run the Inngest and email-preview servers.
- `pnpm typecheck` — `tsc` (noEmit). After editing any `messages/**/*.json`, run `pnpm i18n:generate` first or the message types go stale.
- `pnpm lint` — ESLint (`--fix`); `pnpm fmt` — oxfmt (the formatter; **no Prettier** — `eslint-config-prettier` only switches off ESLint's own formatting rules so oxfmt owns layout). `pnpm cleanup` chains typecheck + fmt + lint.
- `pnpm test` — Vitest (`run`); `pnpm test:watch` to watch. Tests are co-located with their source in `src/features/<feature>/__tests__/` (and `src/lib/<module>/__tests__/` for shared modules); shared test infra lives in `src/lib/vitest/` (`setup.ts`, `helpers/`, `stubs/`). Run one file with `pnpm test src/features/auth/__tests__/signIn.test.ts`, or filter by name with `pnpm test -t 'name'`.
- `pnpm db:generate` — make a migration from schema changes; `pnpm db:migrate:dev|test|prod` — apply; plus `pnpm db:studio`, `pnpm db:seed`, `pnpm db:push`.

Tests run against a dedicated Neon `test` branch (`env/.env.test`), truncating every table between tests (`src/lib/vitest/setup.ts`), so `fileParallelism` is off and a host guard refuses to run unless `DB_CONNECTION_STRING` points at the test branch — dev/prod can never be wiped. `server-only` is stubbed and the auth email boundary is mocked in setup.

## Architecture

Feature-sliced under `src/features/<feature>/` (auth, job-hunt, application, resume, event, activity, notification). A feature folder typically holds `db/` (`schema.ts`, `queries.ts`, `mutations.ts`), `actions/`, `schemas/` (Zod), `view-models/`, `views/`, `components/`, `server/`. Shared infra is in `src/lib/` (better-auth, next-intl, drizzle, form, t3-env, …); shared UI in `src/components/`.

- **Database** — Drizzle + Neon. Per-feature tables live in `src/features/<feature>/db/schema.ts`; the barrel, cross-feature `relations()`, and the `db` client live in `src/db/` (`schema/`, `client.ts`). Queries/mutations are `server-only` and take a `DbExecutor` (db or tx) so a state change and its activity-log write commit in one transaction. Map unique-constraint failures with `isUniqueViolation()`.
- **Server actions + view models** — User mutations go through `createServerAction({ schema, handler })` (`src/lib/next/`), which validates with Zod and **returns** `{ status: 'success' } | { status: 'error'; errorKey }` rather than throwing. The matching client `useXxxVM` hook (react-hook-form via `src/lib/form/`) calls the action and resolves `errorKey` to a localized message.
- **i18n** — next-intl, locales `en-US`/`vi-VN`. Messages split into `client.json` (shipped to the browser) and `server.json` (server-only) under `src/lib/next-intl/messages/{locale}/`, deep-merged server-side. The browser globally receives only the `GLOBAL_CLIENT_NAMESPACES` registry; feature client strings are passed as typed `ClientMessages[...]` props from server parents. Server code reads strings with `getTranslations('namespace')`.
- **Auth** — Better Auth (email+password + Google/GitHub) on the Drizzle adapter; config in `src/lib/better-auth/`. Layouts gate access with `requireUser()` / `requireGuest()` from `src/lib/better-auth/session.ts`; the `(app)` route group is private, `(auth)` is public.

## Domain & decisions

Before using domain vocabulary or touching hunt/application/resume lifecycle, read `CONTEXT.md` (glossary) and `docs/adr/` (load-bearing invariants — e.g. the activity log is the single source of truth for analytics, the selected hunt lives in the `?job_hunt=` URL param). `docs/high-level-design.md` and `docs/tech-stack.md` cover the feature set and stack rationale.

## Code conventions

- Exported functions, variables, and types that carry a dedicated explanatory comment must use JSDoc (`/** */`) so IDE hover tooltips show the description without jumping to the definition. Internal (non-exported) module-scoped symbols keep plain `//` comments.
- The React Compiler is enabled, so do not use `useMemo`, `useCallback`, or `memo` unless there is a very good reason to.
- Define a named `XxxProps` type for component props instead of inlining the object type literal in the parameter list (e.g. `SimpleEmptyProps`).
- Render text through the typography primitives in `src/components/ui/Typography.tsx` (`H1`–`H4`, `P`, `Lead`, `Large`, `Small`, `Muted`, `Blockquote`, `List`, `InlineCode`) instead of hand-styling raw `<h1>`–`<h4>`/`<p>`/`<span>`/`<small>` with text size/weight/color classes. Use the polymorphic `as` prop to change the rendered element (e.g. `<Small as='span'>`) and `className` to fine-tune. Exception: base UI primitives in `src/components/ui/` that wrap third-party primitives (e.g. `DialogTitle`, `SheetDescription`) keep their own elements.
- Route metadata must be localized: export an async `generateMetadata` (never a static `export const metadata`) and pull strings via `await getTranslations('metadata')`. Page titles live under the `metadata` namespace in `server.json` (server-only); the `%s | Faros` title template and `metadataBase` are defined once on the root layout (`src/layout.tsx`), so each page only returns its own translated `title`.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels using their default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
