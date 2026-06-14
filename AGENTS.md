<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

## Script Execution

- Use pnpm instead of bun to execute package.json scripts

## Code conventions

- Exported functions, variables, and types that carry a dedicated explanatory comment must use JSDoc (`/** */`) so IDE hover tooltips show the description without jumping to the definition. Internal (non-exported) module-scoped symbols keep plain `//` comments.
- The React Compiler is enabled, so do not use `useMemo`, `useCallback`, or `memo` unless there is a very good reason to.
- Define a named `XxxProps` type for component props instead of inlining the object type literal in the parameter list (e.g. `SimpleEmptyProps`).
- Render text through the typography primitives in `app/components/ui/Typography.tsx` (`H1`–`H4`, `P`, `Lead`, `Large`, `Small`, `Muted`, `Blockquote`, `List`, `InlineCode`) instead of hand-styling raw `<h1>`–`<h4>`/`<p>`/`<span>`/`<small>` with text size/weight/color classes. Use the polymorphic `as` prop to change the rendered element (e.g. `<Small as='span'>`) and `className` to fine-tune. Exception: base UI primitives in `app/components/ui/` that wrap third-party primitives (e.g. `DialogTitle`, `SheetDescription`) keep their own elements.

## Agent skills

### Issue tracker

Issues and PRDs live as GitHub issues, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical triage labels using their default strings (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
