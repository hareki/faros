# i18n Message Key Reorganization — Design

**Date:** 2026-06-12
**Status:** Approved

## Problem

Translation namespaces were organized **by route**, with a `Client` prefix marking namespaces exposed to client components (`SignUp` / `ClientSignUp`). This broke down in two ways:

1. **Component-specific translations** — shared components like `SimpleEmpty` and `ConfirmDialog` belong to no route; their strings were dumped into `GlobalCommon`, which ships to every client.
2. **Feature components reused across pages** — a component used by several routes fits no route namespace; `ClientAuthentication` was a one-off workaround for the auth feature.

## Design

### Organization: by feature/component

Namespaces are organized by feature or component (next-intl's official recommendation), never by route. All namespace segments are camelCase. Examples: `auth.signUp`, `components.confirmDialog`, `layout.nav`.

### Discrimination: physical client/server file split

Each locale has two files:

```
app/lib/next-intl/messages/
  en-US/
    client.json   ← the only file whose contents may ever reach the browser
    server.json
  vi-VN/
    client.json
    server.json
```

- A feature may appear in **both** files with different leaves (`auth.signUp.title` in `server.json`, `auth.signUp.submit` in `client.json`).
- `request.ts` deep-merges both trees, so server code (`getTranslations`, `getMessages`) sees one unified tree.
- The merged `Messages` type is the intersection `typeof client & typeof server`.
- A `ClientMessages` type (`typeof client.json`) types everything client-bound. Props typed from it physically cannot include server-only strings.
- A CI guard fails if the same leaf path exists in both files (it would silently override in the merge).

### Delivery: hybrid (props by default, registry for globals)

- **Props remain the default**: server components (pages/layouts) build typed message objects from the client tree via `getClientMessages()` and pass them down, e.g. `{ ...client.auth.shared, ...client.auth.signUp }` typed as `ClientMessages['auth']['shared'] & ClientMessages['auth']['signUp']`.
- **Root provider registry**: `GLOBAL_CLIENT_NAMESPACES = ['validation', 'errorBoundary', 'components']` — the only namespaces served to every client via `NextIntlClientProvider`. Client code may call `useTranslations` only on these.
- **Future client-heavy features** (e.g. tracker board) may mount a scoped provider in their segment, picking their feature's subtree from the client tree.

### Namespace migration map

| Old                                          | New file        | New namespace                          |
| -------------------------------------------- | --------------- | -------------------------------------- |
| `Metadata`                                   | server          | `metadata`                             |
| `GlobalValidation`                           | client          | `validation`                           |
| `GlobalErrorBoundary`                        | client          | `errorBoundary`                        |
| `GlobalCommon.noData`                        | client          | `components.simpleEmpty.noData`        |
| `GlobalCommon.confirm.*`                     | client          | `components.confirmDialog.*`           |
| `Layout.search`                              | server          | `layout.search`                        |
| `ClientLayout.{nav,jobHuntSwitcher,navUser}` | client          | `layout.{nav,jobHuntSwitcher,navUser}` |
| `LandingPage`                                | server          | `landingPage`                          |
| `SignIn` / `ClientSignIn`                    | server / client | `auth.signIn`                          |
| `SignUp` / `ClientSignUp`                    | server / client | `auth.signUp`                          |
| `ForgotPassword` / `ClientForgotPassword`    | server / client | `auth.resetPassword`                   |
| `NewPassword` / `ClientNewPassword`          | server / client | `auth.newPassword`                     |
| `ClientAuthentication`                       | client          | `auth.shared`                          |
| `Email`                                      | server          | `email`                                |

## Alternatives considered

- **Single file + `client` sub-keys + typed registry** — least churn, but the client/server line stays a convention (a raw `useTranslations('auth')` in client code compiles and breaks at runtime), and the `Client` prefix smell returns as `client` sub-keys.
- **File per feature per locale** — solves granularity, not the client/server question; premature at the current message volume. Remains available later as an evolution inside each of the two trees.

## Tooling

- `createMessagesDeclaration` receives both en-US paths (accepts `string | Array<string>`), keeping full key/argument type safety for both trees.
- `@lingual/i18n-check` supports folder-per-locale with multiple files; `i18n:check` additionally runs the leaf-overlap guard (`scripts/checkMessageStructure.ts`).
