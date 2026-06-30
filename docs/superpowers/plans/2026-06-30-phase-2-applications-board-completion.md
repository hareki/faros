# Phase 2 - Applications & Board Completion - Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete Phase 2 of Faros - every application mutation, sub-stage/tag CRUD, the settings screens, the application-detail modal+full-page surface, and the board's interactive layer (quick-add, filtering, drag-and-drop).

**Architecture:** Feature-sliced under `src/features/application`. Mutations are `server-only`, take a `DbExecutor`, and compose state changes with their `activity_log` writes in one transaction (the activity log is the analytics source of truth, ADR-0002). User mutations go through `createServerAction({ schema, handler })`, which returns a typed `{ status }` envelope. Server Components fetch and pass typed props into client views. The detail surface uses Next.js parallel + intercepting routes (modal on soft-nav, full page on hard-load).

**Tech Stack:** Next.js 16 (App Router), Drizzle + Neon Postgres, Zod, react-hook-form, next-intl, nuqs v2, `@dnd-kit/react` v0.5, Lexical 0.45, Tailwind v4 + shadcn-style primitives, Vitest.

## Global Constraints

Every task implicitly includes these.

- **Package manager:** `pnpm` only (scripts shell out to `bun --bun` internally). Never `bun` directly.
- **Mutations:** `import 'server-only'`; first param is `executor: DbExecutor`; ownership is scoped `application => job_hunt => user` via the owned-hunt subquery (mirror `setFavorite`).
- **Actions:** `createServerAction({ schema, handler })` from `@/src/lib/next/createServerAction`; `requireUser()` inside; return `ActionResult` (`{ status: 'success' } | { status: 'error'; errorKey }`) - never throw business outcomes. State change + activity writes run inside `db.transaction(...)`.
- **Activity log:** reuse `logActivity` / `recordStageChange` / `recordClose` / `ensureResponseReceived` / `ensureOfferReceived` from `@/src/features/activity/db/mutations`. Do not denormalize milestones onto `applications` (ADR-0002).
- **i18n:** strings live in `src/lib/next-intl/messages/{en-US,vi-VN}/{client,server}.json`, organized by feature/component, camelCase segments. After editing any `messages/**/*.json`, run `pnpm i18n:generate` **before** `pnpm typecheck`. Client strings reach the browser only as typed `ClientMessages[...]` props (never via the global provider unless added to `GLOBAL_CLIENT_NAMESPACES`). Server reads via `getTranslations('namespace')`.
- **Tests:** Vitest, co-located in `src/features/<feature>/__tests__/`, run against the Neon `test` branch (truncated between tests). Run one file: `pnpm test src/features/application/__tests__/<file>`. Helpers: `createUser`, `createVerifiedUser`, `createJobHunt`, `createApplication` from `@/src/lib/vitest/helpers/db`.
- **Code style:** no em dashes; JSDoc (`/** */`) on exported symbols that carry an explanatory comment, plain `//` internally; React Compiler is on (no `useMemo`/`useCallback`/`memo` without strong reason); render text through `src/components/ui/Typography.tsx` primitives; name component props `XxxProps`.
- **Done = verified:** after a phase, run in order: `pnpm cleanup` (typecheck + fmt + lint), `pnpm test`, and the `mcp__fallow__audit` tool over changed files. Fix what they surface before claiming done.
- **Commits:** Conventional Commits with `(fe)`/`(be)` scopes (e.g. `feat(be): ...`). No co-author trailer.

---

## Phase 1 - BE: application mutations + server actions

Adds the six application mutations and their actions, plus the error keys they return, and reconciles the seed. All TDD against the Neon test branch.

### Task 1.1: Error keys, action result types, and i18n error strings

**Files:**
- Modify: `src/features/application/actions/types.ts`
- Modify: `src/lib/next-intl/messages/en-US/client.json`
- Modify: `src/lib/next-intl/messages/vi-VN/client.json`

**Interfaces:**
- Produces: `ApplicationErrorKey = 'errorApplicationNotFound' | 'errorNoActiveJobHunt' | 'errorSubStageInvalid' | 'errorTagInvalid'`; `ApplicationActionResult = ActionResult<ApplicationErrorKey>`.

- [ ] **Step 1: Extend the error-key union**

In `src/features/application/actions/types.ts`:

```typescript
import { type ActionResult } from '@/src/types/common';

/** Feature-specific error keys an application action can return (on top of the global keys). */
export type ApplicationErrorKey =
  | 'errorApplicationNotFound'
  | 'errorNoActiveJobHunt'
  | 'errorSubStageInvalid'
  | 'errorTagInvalid';

export type ApplicationActionResult = ActionResult<ApplicationErrorKey>;
```

- [ ] **Step 2: Add the localized error strings**

In `src/lib/next-intl/messages/en-US/client.json`, add a top-level `application` namespace (used by the board/detail VMs to resolve action errors):

```json
"application": {
  "errors": {
    "errorApplicationNotFound": "We couldn't find that application.",
    "errorNoActiveJobHunt": "Start a hunt before adding applications.",
    "errorSubStageInvalid": "That sub-stage isn't valid for this stage.",
    "errorTagInvalid": "One of those tags is no longer available."
  }
}
```

In `src/lib/next-intl/messages/vi-VN/client.json`, add the mirror with Vietnamese copy:

```json
"application": {
  "errors": {
    "errorApplicationNotFound": "Không tìm thấy đơn ứng tuyển đó.",
    "errorNoActiveJobHunt": "Hãy bắt đầu một đợt tìm việc trước khi thêm đơn.",
    "errorSubStageInvalid": "Giai đoạn phụ đó không hợp lệ cho giai đoạn này.",
    "errorTagInvalid": "Một trong các thẻ đó không còn khả dụng."
  }
}
```

- [ ] **Step 3: Regenerate message types and typecheck**

Run: `pnpm i18n:generate && pnpm typecheck`
Expected: PASS (no type errors; the new `application` namespace is now part of `ClientMessages`).

- [ ] **Step 4: Commit**

```bash
git add src/features/application/actions/types.ts src/lib/next-intl/messages
git commit -m "feat(be): add application action error keys and i18n strings"
```

### Task 1.2: `createApplication` mutation + action (ADR-0006 backfill)

**Files:**
- Modify: `src/features/application/db/mutations.ts`
- Create: `src/features/application/actions/createApplicationAction.ts`
- Modify: `src/features/application/__tests__/mutations.test.ts`
- Create: `src/features/application/__tests__/createApplicationAction.test.ts`

**Interfaces:**
- Consumes: `logActivity`, `ensureResponseReceived`, `recordClose` (`@/src/features/activity/db/mutations`); `getActiveJobHunt` (`@/src/features/job-hunt/db/queries`); `boardStage`, `closedOutcome`, `applicationSource`, `workingModel` enums (`../db/schema`).
- Produces: `createApplication(executor, params: CreateApplicationParams): Promise<{ id: string }>` where
  ```typescript
  type CreateApplicationParams = {
    jobHuntId: string;
    company: string;
    role: string;
    stage: BoardStage;
    source?: ApplicationSource | null;
    jdUrl?: string | null;
    jdText?: string | null;
    location?: string | null;
    workingModel?: WorkingModel | null;
    salaryMin?: number | null;
    salaryMax?: number | null;
    salaryCurrency?: string | null;
    notes?: string | null;
    closedOutcome?: ClosedOutcome | null; // required iff stage === 'closed'
  };
  ```
- Produces: `createApplicationAction(input): Promise<ApplicationActionResult>`.

- [ ] **Step 1: Add the shared owned-hunt-ids helper to mutations.ts**

At the top of `src/features/application/db/mutations.ts` (after the imports), add the helper that scopes writes to the caller's hunts, and refactor `setFavorite` to use it:

```typescript
import { type ClosedOutcome } from '@/src/features/application/types';
// (add to the existing imports) and the activity helpers:
import {
  ensureResponseReceived,
  logActivity,
  recordClose,
} from '@/src/features/activity/db/mutations';

// All applications whose hunt belongs to the user - the ownership predicate every
// application mutation filters by (subquery form, like the original setFavorite).
function ownedJobHuntIds(executor: DbExecutor, userId: string) {
  return executor.select({ id: jobHunts.id }).from(jobHunts).where(eq(jobHunts.userId, userId));
}
```

Then change `setFavorite`'s `inArray(...)` to `inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId))`.

- [ ] **Step 2: Write the failing mutation tests**

Append to `src/features/application/__tests__/mutations.test.ts`. Use raw activity reads to assert backfill:

```typescript
import { activityLog } from '@/src/db/schema';
import { createApplication } from '@/src/features/application/db/mutations';

async function activityTypes(applicationId: string) {
  const rows = await db
    .select({ type: activityLog.type })
    .from(activityLog)
    .where(eq(activityLog.applicationId, applicationId));
  return rows.map((r) => r.type).sort();
}

describe('createApplication', () => {
  it('logs only created for an applied app', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Acme',
      role: 'Engineer',
      stage: 'applied',
    });

    expect(await activityTypes(id)).toEqual(['created']);
  });

  it('backfills response_received for an active app (ADR-0006)', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Globex',
      role: 'FE',
      stage: 'active',
    });

    expect(await activityTypes(id)).toEqual(['created', 'response_received']);
  });

  it('backfills response_received for a final_stages app', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Initech',
      role: 'UI',
      stage: 'final_stages',
    });

    expect(await activityTypes(id)).toEqual(['created', 'response_received']);
  });

  it('closed+rejected logs created+closed+response_received and sets closed columns', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Hooli',
      role: 'Web',
      stage: 'closed',
      closedOutcome: 'rejected',
    });

    expect(await activityTypes(id)).toEqual(['closed', 'created', 'response_received']);
    const [row] = await db.select().from(applications).where(eq(applications.id, id));
    expect(row.closedOutcome).toBe('rejected');
    expect(row.closedAt).not.toBeNull();
  });

  it('closed+accepted backfills offer_received', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);

    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Stark',
      role: 'Eng',
      stage: 'closed',
      closedOutcome: 'accepted',
    });

    expect(await activityTypes(id)).toEqual(['closed', 'created', 'offer_received']);
  });
});
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t createApplication`
Expected: FAIL with "createApplication is not a function" (not yet exported).

- [ ] **Step 4: Implement `createApplication`**

Append to `src/features/application/db/mutations.ts`:

```typescript
type CreateApplicationParams = {
  jobHuntId: string;
  company: string;
  role: string;
  stage: BoardStage;
  source?: ApplicationSource | null;
  jdUrl?: string | null;
  jdText?: string | null;
  location?: string | null;
  workingModel?: WorkingModel | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  notes?: string | null;
  closedOutcome?: ClosedOutcome | null;
};

/**
 * Inserts an application into the given hunt and backfills the milestones the equivalent
 * Applied-then-advance path would have written (ADR-0006), so a migrated/backdated app stays
 * funnel-consistent: `active`/`final_stages` get a first `response_received`; `closed` goes
 * through `recordClose` so the outcome's implications (rejected ⇒ response, accepted ⇒ offer)
 * hold. Always logs `created`. Caller passes a transaction handle so the row and its activity
 * rows commit together. Returns the new id.
 */
export async function createApplication(
  executor: DbExecutor,
  params: CreateApplicationParams,
): Promise<{ id: string }> {
  const isClosed = params.stage === 'closed';

  const [row] = await executor
    .insert(applications)
    .values({
      jobHuntId: params.jobHuntId,
      company: params.company,
      role: params.role,
      stage: params.stage,
      source: params.source ?? null,
      jdUrl: params.jdUrl ?? null,
      jdText: params.jdText ?? null,
      location: params.location ?? null,
      workingModel: params.workingModel ?? null,
      salaryMin: params.salaryMin ?? null,
      salaryMax: params.salaryMax ?? null,
      salaryCurrency: params.salaryCurrency ?? null,
      notes: params.notes ?? null,
      ...(isClosed
        ? { closedOutcome: params.closedOutcome ?? null, closedAt: new Date() }
        : {}),
    })
    .returning({ id: applications.id });

  await logActivity(executor, { applicationId: row.id, type: 'created' });

  if (params.stage === 'active' || params.stage === 'final_stages') {
    await ensureResponseReceived(executor, { applicationId: row.id, trigger: 'stage_advance' });
  } else if (isClosed && params.closedOutcome) {
    await recordClose(executor, { applicationId: row.id, outcome: params.closedOutcome });
  }

  return row;
}
```

Add `BoardStage`, `ApplicationSource`, `WorkingModel` to the type imports from `../types` (they already export `BoardStage`, `ApplicationSource`; add `WorkingModel` and `ClosedOutcome` to `src/features/application/types.ts` - see Step 5).

- [ ] **Step 5: Export the remaining display enums from types.ts**

In `src/features/application/types.ts`, extend the enum re-exports:

```typescript
import type {
  applicationSource,
  boardStage,
  closedOutcome,
  workingModel,
} from './db/schema';

export type BoardStage = (typeof boardStage.enumValues)[number];
export type ApplicationSource = (typeof applicationSource.enumValues)[number];
export type ClosedOutcome = (typeof closedOutcome.enumValues)[number];
export type WorkingModel = (typeof workingModel.enumValues)[number];
```

- [ ] **Step 6: Run the mutation tests to verify they pass**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t createApplication`
Expected: PASS (5 tests).

- [ ] **Step 7: Write the failing action test**

Create `src/features/application/__tests__/createApplicationAction.test.ts` (clone the sign-in harness from `actions.test.ts`):

```typescript
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { db } from '@/src/db/client';
import { applications } from '@/src/db/schema';
import { auth } from '@/src/lib/better-auth';
import { createJobHunt, createVerifiedUser } from '@/src/lib/vitest/helpers/db';

const PASSWORD = 'Sup3r$ecret!';

beforeEach(() => {
  vi.resetModules();
});

async function signIn(email: string) {
  const { headers: responseHeaders } = await auth.api.signInEmail({
    body: { email, password: PASSWORD },
    headers: new Headers(),
    returnHeaders: true,
  });
  const cookie = responseHeaders
    .getSetCookie()
    .map((entry) => entry.split(';')[0])
    .join('; ');
  const requestHeaders = new Headers();
  requestHeaders.set('cookie', cookie);
  vi.mocked(headers).mockResolvedValue(requestHeaders);
}

function importAction() {
  return import('@/src/features/application/actions/createApplicationAction');
}

describe('createApplicationAction', () => {
  it('creates an application in the user’s active hunt', async () => {
    const email = 'create@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    const hunt = await createJobHunt(user.id);
    await signIn(email);

    const { createApplicationAction } = await importAction();
    const result = await createApplicationAction({ company: 'Acme', role: 'Eng', stage: 'applied' });

    expect(result).toEqual({ status: 'success' });
    const rows = await db.select().from(applications).where(eq(applications.jobHuntId, hunt.id));
    expect(rows).toHaveLength(1);
    expect(rows[0].company).toBe('Acme');
  });

  it('returns errorNoActiveJobHunt when the user has no active hunt', async () => {
    const email = 'nohunt@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    await createJobHunt(user.id, { status: 'ended' });
    await signIn(email);

    const { createApplicationAction } = await importAction();
    const result = await createApplicationAction({ company: 'Acme', role: 'Eng', stage: 'applied' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorNoActiveJobHunt' });
  });

  it('rejects a closed stage without an outcome (validation)', async () => {
    const email = 'closedval@example.com';
    const user = await createVerifiedUser({ email, password: PASSWORD });
    await createJobHunt(user.id);
    await signIn(email);

    const { createApplicationAction } = await importAction();
    const result = await createApplicationAction({ company: 'Acme', role: 'Eng', stage: 'closed' });

    expect(result).toEqual({ status: 'error', errorKey: 'errorValidation' });
  });
});
```

- [ ] **Step 8: Run the action test to verify it fails**

Run: `pnpm test src/features/application/__tests__/createApplicationAction.test.ts`
Expected: FAIL ("Cannot find module .../createApplicationAction").

- [ ] **Step 9: Implement `createApplicationAction`**

Create `src/features/application/actions/createApplicationAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { createApplication } from '@/src/features/application/db/mutations';
import {
  applicationSource,
  boardStage,
  closedOutcome,
  workingModel,
} from '@/src/features/application/db/schema';
import { getActiveJobHunt } from '@/src/features/job-hunt/db/queries';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Creates an application in the current user's active hunt. The hunt is resolved server-side
 * (never trusted from the client) since quick-add only exists on the active board. A `closed`
 * stage requires a `closedOutcome`; backfill of implied milestones is `createApplication`'s job
 * (ADR-0006). Yields `errorNoActiveJobHunt` when the user has no active hunt.
 */
export const createApplicationAction = createServerAction({
  schema: () =>
    z
      .object({
        company: z.string().trim().min(1).max(200),
        role: z.string().trim().min(1).max(200),
        stage: z.enum(boardStage.enumValues),
        source: z.enum(applicationSource.enumValues).nullish(),
        jdUrl: z.url().nullish(),
        jdText: z.string().nullish(),
        location: z.string().max(200).nullish(),
        workingModel: z.enum(workingModel.enumValues).nullish(),
        salaryMin: z.number().positive().nullish(),
        salaryMax: z.number().positive().nullish(),
        salaryCurrency: z.string().max(8).nullish(),
        notes: z.string().nullish(),
        closedOutcome: z.enum(closedOutcome.enumValues).nullish(),
      })
      .refine((value) => value.stage !== 'closed' || value.closedOutcome != null, {
        path: ['closedOutcome'],
      }),
  handler: async (data): Promise<ApplicationActionResult> => {
    const user = await requireUser();
    const activeHunt = await getActiveJobHunt(db, user.id);

    if (!activeHunt) {
      return { status: 'error', errorKey: 'errorNoActiveJobHunt' };
    }

    await db.transaction((tx) => createApplication(tx, { jobHuntId: activeHunt.id, ...data }));

    return { status: 'success' };
  },
});
```

- [ ] **Step 10: Run the action test to verify it passes**

Run: `pnpm test src/features/application/__tests__/createApplicationAction.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 11: Commit**

```bash
git add src/features/application
git commit -m "feat(be): createApplication mutation + action with ADR-0006 backfill"
```

### Task 1.3: `updateApplication` mutation + action

**Files:**
- Modify: `src/features/application/db/mutations.ts`
- Create: `src/features/application/actions/updateApplicationAction.ts`
- Modify: `src/features/application/__tests__/mutations.test.ts`
- Create: `src/features/application/__tests__/updateApplicationAction.test.ts`

**Interfaces:**
- Produces: `updateApplication(executor, { userId, id, data }): Promise<ApplicationRow | undefined>` where `data` is the editable-metadata partial (`company?, role?, source?, jdUrl?, jdText?, location?, workingModel?, salaryMin?, salaryMax?, salaryCurrency?, notes?`). Writes `note_added` only on the empty => non-empty `notes` transition. Returns the updated row, or `undefined` when no owned app matches.
- Produces: `updateApplicationAction(input): Promise<ApplicationActionResult>`.

- [ ] **Step 1: Write the failing mutation tests**

Append to `mutations.test.ts`:

```typescript
import { updateApplication } from '@/src/features/application/db/mutations';

describe('updateApplication', () => {
  async function ownedApp(userId: string) {
    const hunt = await createJobHunt(userId);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();
    return app;
  }

  it('updates metadata for an owned app', async () => {
    const user = await createUser();
    const app = await ownedApp(user.id);

    const updated = await updateApplication(db, {
      userId: user.id,
      id: app.id,
      data: { company: 'NewCo', location: 'Remote' },
    });

    expect(updated?.company).toBe('NewCo');
    expect(updated?.location).toBe('Remote');
  });

  it('logs note_added once when notes go empty => non-empty', async () => {
    const user = await createUser();
    const app = await ownedApp(user.id);

    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: 'first note' } });
    await updateApplication(db, { userId: user.id, id: app.id, data: { notes: 'edited note' } });

    expect(await activityTypes(app.id)).toEqual(['note_added']);
  });

  it('leaves another user’s app untouched and returns undefined', async () => {
    const owner = await createUser();
    const other = await createUser();
    const app = await ownedApp(owner.id);

    const result = await updateApplication(db, {
      userId: other.id,
      id: app.id,
      data: { company: 'Hacked' },
    });

    expect(result).toBeUndefined();
    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.company).toBe('Acme');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t updateApplication`
Expected: FAIL ("updateApplication is not a function").

- [ ] **Step 3: Implement `updateApplication`**

Append to `mutations.ts`:

```typescript
type UpdateApplicationData = {
  company?: string;
  role?: string;
  source?: ApplicationSource | null;
  jdUrl?: string | null;
  jdText?: string | null;
  location?: string | null;
  workingModel?: WorkingModel | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  notes?: string | null;
};

type UpdateApplicationParams = { userId: string; id: string; data: UpdateApplicationData };

// Notes are stored as serialized Lexical state; the client sends null/'' when the editor has
// no text content, so a string-presence check is the empty => non-empty test.
function hasNoteContent(notes: string | null | undefined): boolean {
  return notes != null && notes.trim() !== '';
}

/**
 * Owner-scoped update of an application's editable metadata. Writes a single `note_added`
 * activity only on the empty => non-empty `notes` transition (other metadata edits are not
 * milestones, so they log nothing). Returns the updated row, or `undefined` when no owned app
 * matches.
 */
export async function updateApplication(
  executor: DbExecutor,
  { userId, id, data }: UpdateApplicationParams,
) {
  const [current] = await executor
    .select({ notes: applications.notes })
    .from(applications)
    .where(
      and(eq(applications.id, id), inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId))),
    );

  if (!current) {
    return undefined;
  }

  const [updated] = await executor
    .update(applications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .returning();

  if (!hasNoteContent(current.notes) && hasNoteContent(data.notes)) {
    await logActivity(executor, { applicationId: id, type: 'note_added' });
  }

  return updated;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t updateApplication`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the action**

Create `src/features/application/actions/updateApplicationAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { updateApplication } from '@/src/features/application/db/mutations';
import {
  applicationSource,
  workingModel,
} from '@/src/features/application/db/schema';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Owner-scoped update of an application's editable metadata (including Lexical notes). A
 * missing or foreign id yields `errorApplicationNotFound`. The empty => non-empty notes
 * transition logs `note_added` inside `updateApplication`.
 */
export const updateApplicationAction = createServerAction({
  schema: () =>
    z.object({
      id: z.uuid(),
      company: z.string().trim().min(1).max(200).optional(),
      role: z.string().trim().min(1).max(200).optional(),
      source: z.enum(applicationSource.enumValues).nullish(),
      jdUrl: z.url().nullish(),
      jdText: z.string().nullish(),
      location: z.string().max(200).nullish(),
      workingModel: z.enum(workingModel.enumValues).nullish(),
      salaryMin: z.number().positive().nullish(),
      salaryMax: z.number().positive().nullish(),
      salaryCurrency: z.string().max(8).nullish(),
      notes: z.string().nullish(),
    }),
  handler: async ({ id, ...data }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const updated = await db.transaction((tx) =>
      updateApplication(tx, { userId: user.id, id, data }),
    );

    if (!updated) {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    return { status: 'success' };
  },
});
```

- [ ] **Step 6: Write + run the action test**

Create `src/features/application/__tests__/updateApplicationAction.test.ts` mirroring the harness in Task 1.2 Step 7 (sign-in helper, `importAction` => `updateApplicationAction`). Assert: a signed-in owner updates `company`; an intruder gets `{ status: 'error', errorKey: 'errorApplicationNotFound' }`.

Run: `pnpm test src/features/application/__tests__/updateApplicationAction.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/application
git commit -m "feat(be): updateApplication mutation + action"
```

### Task 1.4: `moveStage` mutation + action

**Files:**
- Modify: `src/features/application/db/mutations.ts`
- Create: `src/features/application/actions/moveStageAction.ts`
- Modify: `src/features/application/__tests__/mutations.test.ts`
- Create: `src/features/application/__tests__/moveStageAction.test.ts`

**Interfaces:**
- Produces: `moveStage(executor, { userId, id, to }): Promise<ApplicationRow | undefined>` where `to: Exclude<BoardStage, 'closed'>`. Clears `sub_stage_id`; when re-opening from Closed, clears `closed_outcome`/`closed_at`; calls `recordStageChange` (auto-derives first response on `applied => active/final_stages`). Returns the updated row, or `undefined` when no owned app matches.
- Produces: `moveStageAction(input): Promise<ApplicationActionResult>`.

- [ ] **Step 1: Write the failing mutation tests**

Append to `mutations.test.ts`:

```typescript
import { moveStage } from '@/src/features/application/db/mutations';

describe('moveStage', () => {
  async function ownedAppAt(userId: string, stage: 'applied' | 'active' | 'final_stages' | 'closed') {
    const hunt = await createJobHunt(userId);
    const [app] = await db
      .insert(applications)
      .values({
        jobHuntId: hunt.id,
        company: 'Acme',
        role: 'Eng',
        stage,
        ...(stage === 'closed' ? { closedOutcome: 'withdrawn' as const, closedAt: new Date() } : {}),
      })
      .returning();
    return app;
  }

  it('moves applied => active, clears sub-stage, derives first response', async () => {
    const user = await createUser();
    const app = await ownedAppAt(user.id, 'applied');

    const updated = await moveStage(db, { userId: user.id, id: app.id, to: 'active' });

    expect(updated?.stage).toBe('active');
    expect(updated?.subStageId).toBeNull();
    expect(await activityTypes(app.id)).toEqual(['response_received', 'stage_change']);
  });

  it('re-opening from closed clears closed columns', async () => {
    const user = await createUser();
    const app = await ownedAppAt(user.id, 'closed');

    const updated = await moveStage(db, { userId: user.id, id: app.id, to: 'active' });

    expect(updated?.stage).toBe('active');
    expect(updated?.closedOutcome).toBeNull();
    expect(updated?.closedAt).toBeNull();
  });

  it('returns undefined for a foreign app', async () => {
    const owner = await createUser();
    const other = await createUser();
    const app = await ownedAppAt(owner.id, 'applied');

    expect(await moveStage(db, { userId: other.id, id: app.id, to: 'active' })).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t moveStage`
Expected: FAIL ("moveStage is not a function").

- [ ] **Step 3: Implement `moveStage`**

Append to `mutations.ts` (and add `recordStageChange` to the activity-helpers import):

```typescript
type MoveStageParams = { userId: string; id: string; to: Exclude<BoardStage, 'closed'> };

/**
 * Moves an owned application between non-closed stages (or re-opens it from Closed). Clears
 * `sub_stage_id` (a stage move invalidates the stage-bound sub-stage, ADR-0001) and any closed
 * columns, then stamps `stage_change` via `recordStageChange`, which auto-derives the first
 * `response_received` on `applied => active/final_stages`. Closing is `closeApplication`'s job,
 * never this one. Returns the updated row, or `undefined` when no owned app matches.
 */
export async function moveStage(executor: DbExecutor, { userId, id, to }: MoveStageParams) {
  const [current] = await executor
    .select({ stage: applications.stage })
    .from(applications)
    .where(
      and(eq(applications.id, id), inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId))),
    );

  if (!current) {
    return undefined;
  }

  const [updated] = await executor
    .update(applications)
    .set({ stage: to, subStageId: null, closedOutcome: null, closedAt: null, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .returning();

  if (current.stage !== to) {
    await recordStageChange(executor, { applicationId: id, from: current.stage, to });
  }

  return updated;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t moveStage`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the action**

Create `src/features/application/actions/moveStageAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { moveStage } from '@/src/features/application/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

// Closing is its own action (closeApplicationAction) because it needs an outcome; moveStage
// only handles the non-closed columns.
const MOVABLE_STAGES = ['applied', 'active', 'final_stages'] as const;

/**
 * Moves an owned application to a non-closed stage (or re-opens it from Closed). A missing or
 * foreign id yields `errorApplicationNotFound`. Dropping into Closed is rejected at the schema
 * (use `closeApplicationAction`).
 */
export const moveStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), to: z.enum(MOVABLE_STAGES) }),
  handler: async ({ id, to }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const updated = await db.transaction((tx) => moveStage(tx, { userId: user.id, id, to }));

    if (!updated) {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    return { status: 'success' };
  },
});
```

- [ ] **Step 6: Write + run the action test**

Create `moveStageAction.test.ts` (same harness). Assert: owner moves `applied => active` => success; intruder => `errorApplicationNotFound`; `to: 'closed'` => `errorValidation`.

Run: `pnpm test src/features/application/__tests__/moveStageAction.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/application
git commit -m "feat(be): moveStage mutation + action"
```

### Task 1.5: `setSubStage` mutation + action

**Files:**
- Modify: `src/features/application/db/mutations.ts`
- Create: `src/features/application/actions/setSubStageAction.ts`
- Modify: `src/features/application/__tests__/mutations.test.ts`
- Create: `src/features/application/__tests__/setSubStageAction.test.ts`

**Interfaces:**
- Produces: `setSubStage(executor, { userId, id, subStageId }): Promise<SetSubStageResult>` where `subStageId: string | null` and `SetSubStageResult = { status: 'ok' } | { status: 'application_not_found' } | { status: 'sub_stage_invalid' }`. Validates the sub-stage belongs to the user and matches the app's current stage; logs `sub_stage_change` with sub-stage **names**.
- Produces: `setSubStageAction(input): Promise<ApplicationActionResult>` mapping `sub_stage_invalid => errorSubStageInvalid`, `application_not_found => errorApplicationNotFound`.

- [ ] **Step 1: Write the failing mutation tests**

Append to `mutations.test.ts` (needs `subStages` import from `@/src/db/schema`):

```typescript
import { subStages } from '@/src/db/schema';
import { setSubStage } from '@/src/features/application/db/mutations';

describe('setSubStage', () => {
  async function activeAppWithSubStages(userId: string) {
    const hunt = await createJobHunt(userId);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();
    const [sub] = await db
      .insert(subStages)
      .values({ userId, stage: 'active', name: 'HR Screen', sortOrder: 0 })
      .returning();
    const [wrongStage] = await db
      .insert(subStages)
      .values({ userId, stage: 'final_stages', name: 'Onsite', sortOrder: 0 })
      .returning();
    return { app, sub, wrongStage };
  }

  it('sets a valid sub-stage and logs sub_stage_change with the name', async () => {
    const user = await createUser();
    const { app, sub } = await activeAppWithSubStages(user.id);

    const result = await setSubStage(db, { userId: user.id, id: app.id, subStageId: sub.id });

    expect(result).toEqual({ status: 'ok' });
    const [row] = await db.select().from(applications).where(eq(applications.id, app.id));
    expect(row.subStageId).toBe(sub.id);
    const [log] = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.applicationId, app.id));
    expect(log.type).toBe('sub_stage_change');
    expect(log.metadata).toEqual({ from: null, to: 'HR Screen' });
  });

  it('rejects a sub-stage from a different stage', async () => {
    const user = await createUser();
    const { app, wrongStage } = await activeAppWithSubStages(user.id);

    const result = await setSubStage(db, { userId: user.id, id: app.id, subStageId: wrongStage.id });

    expect(result).toEqual({ status: 'sub_stage_invalid' });
  });

  it('returns application_not_found for a foreign app', async () => {
    const owner = await createUser();
    const other = await createUser();
    const { app, sub } = await activeAppWithSubStages(owner.id);

    const result = await setSubStage(db, { userId: other.id, id: app.id, subStageId: sub.id });

    expect(result).toEqual({ status: 'application_not_found' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t setSubStage`
Expected: FAIL ("setSubStage is not a function").

- [ ] **Step 3: Implement `setSubStage`**

Append to `mutations.ts` (add `subStages` to the schema import):

```typescript
export type SetSubStageResult =
  | { status: 'ok' }
  | { status: 'application_not_found' }
  | { status: 'sub_stage_invalid' };

type SetSubStageParams = { userId: string; id: string; subStageId: string | null };

/**
 * Sets (or clears, with `null`) an owned application's sub-stage. The target sub-stage must
 * belong to the user and match the app's current stage (the composite FK is the DB backstop,
 * ADR-0001). Logs `sub_stage_change` with sub-stage names - not ids - so the timeline reads
 * correctly after a later rename or delete.
 */
export async function setSubStage(
  executor: DbExecutor,
  { userId, id, subStageId }: SetSubStageParams,
): Promise<SetSubStageResult> {
  const [app] = await executor
    .select({ stage: applications.stage, subStageId: applications.subStageId })
    .from(applications)
    .where(
      and(eq(applications.id, id), inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId))),
    );

  if (!app) {
    return { status: 'application_not_found' };
  }

  let toName: string | null = null;

  if (subStageId !== null) {
    const [target] = await executor
      .select({ name: subStages.name, stage: subStages.stage })
      .from(subStages)
      .where(and(eq(subStages.id, subStageId), eq(subStages.userId, userId)));

    if (!target || target.stage !== app.stage) {
      return { status: 'sub_stage_invalid' };
    }

    toName = target.name;
  }

  let fromName: string | null = null;

  if (app.subStageId) {
    const [previous] = await executor
      .select({ name: subStages.name })
      .from(subStages)
      .where(eq(subStages.id, app.subStageId));
    fromName = previous?.name ?? null;
  }

  await executor
    .update(applications)
    .set({ subStageId, updatedAt: new Date() })
    .where(eq(applications.id, id));

  await logActivity(executor, {
    applicationId: id,
    type: 'sub_stage_change',
    metadata: { from: fromName, to: toName },
  });

  return { status: 'ok' };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t setSubStage`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the action**

Create `src/features/application/actions/setSubStageAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { setSubStage } from '@/src/features/application/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Sets or clears an owned application's sub-stage. Maps the mutation's discriminated result to
 * `errorApplicationNotFound` / `errorSubStageInvalid`.
 */
export const setSubStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), subStageId: z.uuid().nullable() }),
  handler: async ({ id, subStageId }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const result = await db.transaction((tx) =>
      setSubStage(tx, { userId: user.id, id, subStageId }),
    );

    if (result.status === 'application_not_found') {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    if (result.status === 'sub_stage_invalid') {
      return { status: 'error', errorKey: 'errorSubStageInvalid' };
    }

    return { status: 'success' };
  },
});
```

- [ ] **Step 6: Write + run the action test**

Create `setSubStageAction.test.ts`. Assert: owner sets a valid sub-stage => success; cross-stage sub-stage => `errorSubStageInvalid`; foreign app => `errorApplicationNotFound`.

Run: `pnpm test src/features/application/__tests__/setSubStageAction.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/application
git commit -m "feat(be): setSubStage mutation + action"
```

### Task 1.6: `setTags` mutation + action

**Files:**
- Modify: `src/features/application/db/mutations.ts`
- Create: `src/features/application/actions/setTagsAction.ts`
- Modify: `src/features/application/__tests__/mutations.test.ts`
- Create: `src/features/application/__tests__/setTagsAction.test.ts`

**Interfaces:**
- Produces: `setTags(executor, { userId, id, tagIds }): Promise<SetTagsResult>` where `SetTagsResult = { status: 'ok' } | { status: 'application_not_found' } | { status: 'tag_invalid' }`. Replaces the `application_tags` set; validates every tag id belongs to the user; writes **no** activity.
- Produces: `setTagsAction(input): Promise<ApplicationActionResult>` mapping `tag_invalid => errorTagInvalid`.

- [ ] **Step 1: Write the failing mutation tests**

Append to `mutations.test.ts` (needs `tags`, `applicationTags` from `@/src/db/schema`):

```typescript
import { applicationTags, tags } from '@/src/db/schema';
import { setTags } from '@/src/features/application/db/mutations';

describe('setTags', () => {
  async function appAndTags(userId: string) {
    const hunt = await createJobHunt(userId);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();
    const tagRows = await db
      .insert(tags)
      .values([
        { userId, name: 'remote' },
        { userId, name: 'startup' },
      ])
      .returning();
    return { app, tagRows };
  }

  it('replaces the tag set for an owned app', async () => {
    const user = await createUser();
    const { app, tagRows } = await appAndTags(user.id);

    await setTags(db, { userId: user.id, id: app.id, tagIds: [tagRows[0].id, tagRows[1].id] });
    await setTags(db, { userId: user.id, id: app.id, tagIds: [tagRows[1].id] });

    const joined = await db
      .select({ tagId: applicationTags.tagId })
      .from(applicationTags)
      .where(eq(applicationTags.applicationId, app.id));
    expect(joined.map((r) => r.tagId)).toEqual([tagRows[1].id]);
  });

  it('rejects a tag the user does not own', async () => {
    const user = await createUser();
    const stranger = await createUser();
    const { app } = await appAndTags(user.id);
    const [foreignTag] = await db.insert(tags).values({ userId: stranger.id, name: 'x' }).returning();

    const result = await setTags(db, { userId: user.id, id: app.id, tagIds: [foreignTag.id] });

    expect(result).toEqual({ status: 'tag_invalid' });
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t setTags`
Expected: FAIL ("setTags is not a function").

- [ ] **Step 3: Implement `setTags`**

Append to `mutations.ts` (add `tags`, `applicationTags` to the schema import):

```typescript
export type SetTagsResult =
  | { status: 'ok' }
  | { status: 'application_not_found' }
  | { status: 'tag_invalid' };

type SetTagsParams = { userId: string; id: string; tagIds: string[] };

/**
 * Replaces an owned application's tag set. Every tag id must belong to the user. Tags are
 * filter-only/organizational, so this writes no activity (mirrors `setFavorite`, ADR-0007).
 */
export async function setTags(
  executor: DbExecutor,
  { userId, id, tagIds }: SetTagsParams,
): Promise<SetTagsResult> {
  const [app] = await executor
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(eq(applications.id, id), inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId))),
    );

  if (!app) {
    return { status: 'application_not_found' };
  }

  const uniqueIds = [...new Set(tagIds)];

  if (uniqueIds.length > 0) {
    const owned = await executor
      .select({ id: tags.id })
      .from(tags)
      .where(and(eq(tags.userId, userId), inArray(tags.id, uniqueIds)));

    if (owned.length !== uniqueIds.length) {
      return { status: 'tag_invalid' };
    }
  }

  await executor.delete(applicationTags).where(eq(applicationTags.applicationId, id));

  if (uniqueIds.length > 0) {
    await executor
      .insert(applicationTags)
      .values(uniqueIds.map((tagId) => ({ applicationId: id, tagId })));
  }

  await executor.update(applications).set({ updatedAt: new Date() }).where(eq(applications.id, id));

  return { status: 'ok' };
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t setTags`
Expected: PASS (2 tests).

- [ ] **Step 5: Implement the action**

Create `src/features/application/actions/setTagsAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { setTags } from '@/src/features/application/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/** Replaces an owned application's tags. Maps `tag_invalid => errorTagInvalid`. */
export const setTagsAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), tagIds: z.array(z.uuid()) }),
  handler: async ({ id, tagIds }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const result = await db.transaction((tx) => setTags(tx, { userId: user.id, id, tagIds }));

    if (result.status === 'application_not_found') {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    if (result.status === 'tag_invalid') {
      return { status: 'error', errorKey: 'errorTagInvalid' };
    }

    return { status: 'success' };
  },
});
```

- [ ] **Step 6: Write + run the action test**

Create `setTagsAction.test.ts`. Assert: owner sets tags => success; foreign tag => `errorTagInvalid`; foreign app => `errorApplicationNotFound`.

Run: `pnpm test src/features/application/__tests__/setTagsAction.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/application
git commit -m "feat(be): setTags mutation + action"
```

### Task 1.7: `closeApplication` mutation + action

**Files:**
- Modify: `src/features/application/db/mutations.ts`
- Create: `src/features/application/actions/closeApplicationAction.ts`
- Modify: `src/features/application/__tests__/mutations.test.ts`
- Create: `src/features/application/__tests__/closeApplicationAction.test.ts`

**Interfaces:**
- Produces: `closeApplication(executor, { userId, id, outcome }): Promise<ApplicationRow | undefined>` where `outcome: ClosedOutcome`. Sets `stage='closed'`, `closedOutcome`, `closedAt=now`, clears `sub_stage_id`; calls `recordClose` (derives response/offer). Returns the updated row, or `undefined`.
- Produces: `closeApplicationAction(input): Promise<ApplicationActionResult>`.

- [ ] **Step 1: Write the failing mutation tests**

Append to `mutations.test.ts`:

```typescript
import { closeApplication } from '@/src/features/application/db/mutations';

describe('closeApplication', () => {
  async function activeApp(userId: string) {
    const hunt = await createJobHunt(userId);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', stage: 'active' })
      .returning();
    return app;
  }

  it('closes as accepted and backfills offer_received', async () => {
    const user = await createUser();
    const app = await activeApp(user.id);

    const updated = await closeApplication(db, { userId: user.id, id: app.id, outcome: 'accepted' });

    expect(updated?.stage).toBe('closed');
    expect(updated?.closedOutcome).toBe('accepted');
    expect(updated?.closedAt).not.toBeNull();
    expect(await activityTypes(app.id)).toEqual(['closed', 'offer_received']);
  });

  it('closes as ghosted with no derived milestone', async () => {
    const user = await createUser();
    const app = await activeApp(user.id);

    await closeApplication(db, { userId: user.id, id: app.id, outcome: 'ghosted' });

    expect(await activityTypes(app.id)).toEqual(['closed']);
  });

  it('returns undefined for a foreign app', async () => {
    const owner = await createUser();
    const other = await createUser();
    const app = await activeApp(owner.id);

    expect(
      await closeApplication(db, { userId: other.id, id: app.id, outcome: 'rejected' }),
    ).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t closeApplication`
Expected: FAIL ("closeApplication is not a function").

- [ ] **Step 3: Implement `closeApplication`**

Append to `mutations.ts`:

```typescript
type CloseApplicationParams = { userId: string; id: string; outcome: ClosedOutcome };

/**
 * Closes an owned application: sets `stage='closed'` with the outcome + `closedAt`, clears the
 * sub-stage, and records the `closed` activity via `recordClose` (which derives the
 * outcome-implied response/offer). Returns the updated row, or `undefined` when no owned app
 * matches.
 */
export async function closeApplication(
  executor: DbExecutor,
  { userId, id, outcome }: CloseApplicationParams,
) {
  const [current] = await executor
    .select({ id: applications.id })
    .from(applications)
    .where(
      and(eq(applications.id, id), inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId))),
    );

  if (!current) {
    return undefined;
  }

  const now = new Date();

  const [updated] = await executor
    .update(applications)
    .set({ stage: 'closed', closedOutcome: outcome, closedAt: now, subStageId: null, updatedAt: now })
    .where(eq(applications.id, id))
    .returning();

  await recordClose(executor, { applicationId: id, outcome });

  return updated;
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/mutations.test.ts -t closeApplication`
Expected: PASS (3 tests).

- [ ] **Step 5: Implement the action**

Create `src/features/application/actions/closeApplicationAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { closeApplication } from '@/src/features/application/db/mutations';
import { closedOutcome } from '@/src/features/application/db/schema';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Closes an owned application with a required outcome (the Close-outcome prompt collects it). A
 * missing or foreign id yields `errorApplicationNotFound`.
 */
export const closeApplicationAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), outcome: z.enum(closedOutcome.enumValues) }),
  handler: async ({ id, outcome }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const updated = await db.transaction((tx) =>
      closeApplication(tx, { userId: user.id, id, outcome }),
    );

    if (!updated) {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    return { status: 'success' };
  },
});
```

- [ ] **Step 6: Write + run the action test**

Create `closeApplicationAction.test.ts`. Assert: owner closes as `accepted` => success (row `stage='closed'`); intruder => `errorApplicationNotFound`.

Run: `pnpm test src/features/application/__tests__/closeApplicationAction.test.ts`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/features/application
git commit -m "feat(be): closeApplication mutation + action"
```

### Task 1.8: Reconcile the seed with ADR-0006 backfill

**Files:**
- Modify: `src/db/seed.ts`

The seed hand-writes activity rows that miss the backfill the new `createApplication` would produce: the `active` app has no `response_received`, and the `closed`-rejected app has no `response_received`. Make the seeded activity log funnel-consistent.

- [ ] **Step 1: Add the missing backfill rows**

In `src/db/seed.ts`, in the `activityLog` insert (around L219), add a `response_received` row for the `active` app (after its `stage_change`) and for the `closed` app (after its `closed`):

```typescript
    { applicationId: active.id, type: 'response_received', metadata: { trigger: 'stage_advance' } },
    { applicationId: finalApp.id, type: 'response_received', metadata: { trigger: 'stage_advance' } },
    { applicationId: closed.id, type: 'response_received', metadata: { trigger: 'closed_rejected' } },
```

(The `finalApp` row mirrors the `active => final_stages` advance; the `closed` row mirrors `recordClose('rejected')`.)

- [ ] **Step 2: Re-seed against the dev branch and verify it runs**

Run: `pnpm db:seed`
Expected: completes with the "Seeded …" summary, no errors.

- [ ] **Step 3: Commit**

```bash
git add src/db/seed.ts
git commit -m "fix(be): seed backfills response milestones for non-applied apps (ADR-0006)"
```

### Phase 1 verification

- [ ] Run `pnpm cleanup` - fix any typecheck/lint/format issues.
- [ ] Run `pnpm test` - all suites green.
- [ ] Run `mcp__fallow__audit` over the changed files - address or note findings.

---

## Phase 2 - BE: sub-stage & tag CRUD

Adds the per-user sub-stage CRUD (restricted to Active and Final Stages, with reorder) and per-user tag CRUD, plus their queries. These back the Settings screens (Phase 3), the detail pickers (Phase 4), and the board filter options (Phase 5).

### Task 2.1: Settings action-result types

**Files:**
- Modify: `src/features/application/actions/types.ts`

**Interfaces:**
- Produces: `SubStageActionResult = ActionResult<'errorSubStageNameTaken' | 'errorSubStageNotFound'>`; `TagActionResult = ActionResult<'errorTagNameTaken' | 'errorTagNotFound'>`.

- [ ] **Step 1: Add the settings result types**

Append to `src/features/application/actions/types.ts`:

```typescript
export type SubStageErrorKey = 'errorSubStageNameTaken' | 'errorSubStageNotFound';
export type SubStageActionResult = ActionResult<SubStageErrorKey>;

export type TagErrorKey = 'errorTagNameTaken' | 'errorTagNotFound';
export type TagActionResult = ActionResult<TagErrorKey>;
```

- [ ] **Step 2: Typecheck**

Run: `pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/features/application/actions/types.ts
git commit -m "feat(be): add sub-stage and tag action-result types"
```

### Task 2.2: Sub-stage queries + CRUD mutations + actions

**Files:**
- Modify: `src/features/application/db/queries.ts`
- Create: `src/features/application/db/subStageMutations.ts`
- Create: `src/features/application/actions/createSubStageAction.ts`
- Create: `src/features/application/actions/renameSubStageAction.ts`
- Create: `src/features/application/actions/deleteSubStageAction.ts`
- Create: `src/features/application/__tests__/subStageMutations.test.ts`
- Create: `src/features/application/__tests__/subStageActions.test.ts`

**Interfaces:**
- Produces: `listSubStages(executor, userId): Promise<SubStageRow[]>` where `SubStageRow = { id: string; stage: BoardStage; name: string; sortOrder: number }`, ordered by stage then `sortOrder`.
- Produces: `createSubStage(executor, { userId, stage, name }): Promise<SubStageRow>` (appends at the next `sortOrder`); `renameSubStage(executor, { userId, id, name }): Promise<SubStageRow | undefined>`; `deleteSubStage(executor, { userId, id }): Promise<{ id: string } | undefined>`.
- Produces actions: `createSubStageAction`, `renameSubStageAction`, `deleteSubStageAction` returning `SubStageActionResult`.

- [ ] **Step 1: Add `listSubStages` to queries.ts**

Append to `src/features/application/db/queries.ts` (add `asc` to the drizzle import, and import `subStages`, `tags` from the schema; `listTags` lands in Task 2.4):

```typescript
import { subStages } from '@/src/features/application/db/schema';
import { type BoardStage } from '@/src/features/application/types';

export type SubStageRow = { id: string; stage: BoardStage; name: string; sortOrder: number };

/** A user's sub-stages for the settings list and the detail picker, ordered by stage then sort. */
export async function listSubStages(
  executor: DbExecutor,
  userId: string,
): Promise<SubStageRow[]> {
  return executor
    .select({
      id: subStages.id,
      stage: subStages.stage,
      name: subStages.name,
      sortOrder: subStages.sortOrder,
    })
    .from(subStages)
    .where(eq(subStages.userId, userId))
    .orderBy(asc(subStages.stage), asc(subStages.sortOrder));
}
```

- [ ] **Step 2: Write the failing mutation tests**

Create `src/features/application/__tests__/subStageMutations.test.ts`:

```typescript
import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { subStages } from '@/src/db/schema';
import {
  createSubStage,
  deleteSubStage,
  renameSubStage,
} from '@/src/features/application/db/subStageMutations';
import { createUser } from '@/src/lib/vitest/helpers/db';

describe('createSubStage', () => {
  it('appends sub-stages with increasing sortOrder per stage', async () => {
    const user = await createUser();

    const first = await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });
    const second = await createSubStage(db, { userId: user.id, stage: 'active', name: 'Tech' });

    expect(first.sortOrder).toBe(0);
    expect(second.sortOrder).toBe(1);
  });

  it('throws a unique violation on a duplicate name within a stage', async () => {
    const user = await createUser();
    await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });

    await expect(
      createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' }),
    ).rejects.toThrow();
  });
});

describe('renameSubStage / deleteSubStage', () => {
  it('renames an owned sub-stage', async () => {
    const user = await createUser();
    const sub = await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });

    const renamed = await renameSubStage(db, { userId: user.id, id: sub.id, name: 'HR Screen' });

    expect(renamed?.name).toBe('HR Screen');
  });

  it('returns undefined when renaming a foreign sub-stage', async () => {
    const owner = await createUser();
    const other = await createUser();
    const sub = await createSubStage(db, { userId: owner.id, stage: 'active', name: 'HR' });

    expect(await renameSubStage(db, { userId: other.id, id: sub.id, name: 'X' })).toBeUndefined();
  });

  it('deletes an owned sub-stage', async () => {
    const user = await createUser();
    const sub = await createSubStage(db, { userId: user.id, stage: 'active', name: 'HR' });

    await deleteSubStage(db, { userId: user.id, id: sub.id });

    const rows = await db
      .select()
      .from(subStages)
      .where(and(eq(subStages.id, sub.id)));
    expect(rows).toHaveLength(0);
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/subStageMutations.test.ts`
Expected: FAIL ("Cannot find module .../subStageMutations").

- [ ] **Step 4: Implement the sub-stage mutations**

Create `src/features/application/db/subStageMutations.ts`:

```typescript
import 'server-only';

import { and, eq, sql } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { subStages } from '@/src/features/application/db/schema';
import { type SubStageRow } from '@/src/features/application/db/queries';

type StageBound = 'active' | 'final_stages';

/**
 * Appends a sub-stage at the end of its stage's ordering for the user. The next `sortOrder` is
 * `max + 1` within (user, stage). A duplicate name within the stage trips the
 * `sub_stages_user_stage_name_unique` index (Postgres 23505) for the action to map.
 */
export async function createSubStage(
  executor: DbExecutor,
  { userId, stage, name }: { userId: string; stage: StageBound; name: string },
): Promise<SubStageRow> {
  const [{ next }] = await executor
    .select({ next: sql<number>`coalesce(max(${subStages.sortOrder}), -1) + 1` })
    .from(subStages)
    .where(and(eq(subStages.userId, userId), eq(subStages.stage, stage)));

  const [row] = await executor
    .insert(subStages)
    .values({ userId, stage, name, sortOrder: next })
    .returning({
      id: subStages.id,
      stage: subStages.stage,
      name: subStages.name,
      sortOrder: subStages.sortOrder,
    });

  return row;
}

/** Renames an owned sub-stage. Returns the row, or `undefined` when none matches. */
export async function renameSubStage(
  executor: DbExecutor,
  { userId, id, name }: { userId: string; id: string; name: string },
) {
  const rows = await executor
    .update(subStages)
    .set({ name })
    .where(and(eq(subStages.id, id), eq(subStages.userId, userId)))
    .returning({ id: subStages.id, name: subStages.name });

  return rows.at(0);
}

/** Deletes an owned sub-stage (apps referencing it have `sub_stage_id` set null by the FK). */
export async function deleteSubStage(
  executor: DbExecutor,
  { userId, id }: { userId: string; id: string },
) {
  const rows = await executor
    .delete(subStages)
    .where(and(eq(subStages.id, id), eq(subStages.userId, userId)))
    .returning({ id: subStages.id });

  return rows.at(0);
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/subStageMutations.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Implement the three actions**

Create `src/features/application/actions/createSubStageAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { createSubStage } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

// Sub-stages exist only for the interviewing columns (CONTEXT.md), so the schema rejects the
// other stages outright.
const SUB_STAGE_STAGES = ['active', 'final_stages'] as const;

/** Creates a sub-stage for a stage. A duplicate name yields `errorSubStageNameTaken`. */
export const createSubStageAction = createServerAction({
  schema: () =>
    z.object({
      stage: z.enum(SUB_STAGE_STAGES),
      name: z.string().trim().min(1).max(100),
    }),
  handler: async ({ stage, name }): Promise<SubStageActionResult> => {
    const user = await requireUser();

    try {
      await createSubStage(db, { userId: user.id, stage, name });
    } catch (error) {
      if (isUniqueViolation(error, 'sub_stages_user_stage_name_unique')) {
        return { status: 'error', errorKey: 'errorSubStageNameTaken' };
      }

      throw error;
    }

    return { status: 'success' };
  },
});
```

Create `src/features/application/actions/renameSubStageAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { renameSubStage } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

/** Renames an owned sub-stage. Missing => `errorSubStageNotFound`; dup => `errorSubStageNameTaken`. */
export const renameSubStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), name: z.string().trim().min(1).max(100) }),
  handler: async ({ id, name }): Promise<SubStageActionResult> => {
    const user = await requireUser();

    try {
      const renamed = await renameSubStage(db, { userId: user.id, id, name });

      if (!renamed) {
        return { status: 'error', errorKey: 'errorSubStageNotFound' };
      }
    } catch (error) {
      if (isUniqueViolation(error, 'sub_stages_user_stage_name_unique')) {
        return { status: 'error', errorKey: 'errorSubStageNameTaken' };
      }

      throw error;
    }

    return { status: 'success' };
  },
});
```

Create `src/features/application/actions/deleteSubStageAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { deleteSubStage } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

/** Deletes an owned sub-stage. A missing or foreign id yields `errorSubStageNotFound`. */
export const deleteSubStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid() }),
  handler: async ({ id }): Promise<SubStageActionResult> => {
    const user = await requireUser();
    const deleted = await deleteSubStage(db, { userId: user.id, id });

    if (!deleted) {
      return { status: 'error', errorKey: 'errorSubStageNotFound' };
    }

    return { status: 'success' };
  },
});
```

- [ ] **Step 7: Write + run the action tests**

Create `src/features/application/__tests__/subStageActions.test.ts` using the sign-in harness (Task 1.2 Step 7). Assert: create succeeds for the signed-in user; a duplicate name => `errorSubStageNameTaken`; rename of a foreign sub-stage => `errorSubStageNotFound`; `stage: 'applied'` on create => `errorValidation`.

Run: `pnpm test src/features/application/__tests__/subStageActions.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/application
git commit -m "feat(be): sub-stage list query + CRUD mutations and actions"
```

### Task 2.3: `reorderSubStages` mutation + action

**Files:**
- Modify: `src/features/application/db/subStageMutations.ts`
- Create: `src/features/application/actions/reorderSubStagesAction.ts`
- Modify: `src/features/application/__tests__/subStageMutations.test.ts`

**Interfaces:**
- Produces: `reorderSubStages(executor, { userId, stage, orderedIds }): Promise<void>` - assigns `sortOrder = index` to each id within (user, stage).
- Produces: `reorderSubStagesAction(input): Promise<SubStageActionResult>`.

- [ ] **Step 1: Write the failing test**

Append to `subStageMutations.test.ts`:

```typescript
import { reorderSubStages } from '@/src/features/application/db/subStageMutations';

describe('reorderSubStages', () => {
  it('rewrites sortOrder to match the given order', async () => {
    const user = await createUser();
    const a = await createSubStage(db, { userId: user.id, stage: 'active', name: 'A' });
    const b = await createSubStage(db, { userId: user.id, stage: 'active', name: 'B' });
    const c = await createSubStage(db, { userId: user.id, stage: 'active', name: 'C' });

    await reorderSubStages(db, {
      userId: user.id,
      stage: 'active',
      orderedIds: [c.id, a.id, b.id],
    });

    const rows = await db
      .select({ id: subStages.id, sortOrder: subStages.sortOrder })
      .from(subStages)
      .where(eq(subStages.userId, user.id));
    const order = Object.fromEntries(rows.map((r) => [r.id, r.sortOrder]));
    expect(order[c.id]).toBe(0);
    expect(order[a.id]).toBe(1);
    expect(order[b.id]).toBe(2);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/subStageMutations.test.ts -t reorderSubStages`
Expected: FAIL ("reorderSubStages is not a function").

- [ ] **Step 3: Implement `reorderSubStages`**

Append to `subStageMutations.ts`:

```typescript
/**
 * Rewrites `sortOrder` to the given order within one (user, stage). Callers pass a transaction
 * handle so the renumbering is atomic. Ids not owned by the user (or in another stage) are
 * silently skipped by the predicate.
 */
export async function reorderSubStages(
  executor: DbExecutor,
  { userId, stage, orderedIds }: { userId: string; stage: StageBound; orderedIds: string[] },
): Promise<void> {
  for (const [index, id] of orderedIds.entries()) {
    await executor
      .update(subStages)
      .set({ sortOrder: index })
      .where(
        and(eq(subStages.id, id), eq(subStages.userId, userId), eq(subStages.stage, stage)),
      );
  }
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/subStageMutations.test.ts -t reorderSubStages`
Expected: PASS.

- [ ] **Step 5: Implement the action**

Create `src/features/application/actions/reorderSubStagesAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { reorderSubStages } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

const SUB_STAGE_STAGES = ['active', 'final_stages'] as const;

/** Persists a drag-reordered sub-stage list (Settings). Always succeeds for owned ids. */
export const reorderSubStagesAction = createServerAction({
  schema: () =>
    z.object({ stage: z.enum(SUB_STAGE_STAGES), orderedIds: z.array(z.uuid()) }),
  handler: async ({ stage, orderedIds }): Promise<SubStageActionResult> => {
    const user = await requireUser();

    await db.transaction((tx) => reorderSubStages(tx, { userId: user.id, stage, orderedIds }));

    return { status: 'success' };
  },
});
```

- [ ] **Step 6: Commit**

```bash
git add src/features/application
git commit -m "feat(be): reorderSubStages mutation + action"
```

### Task 2.4: Tag query + CRUD mutations + actions

**Files:**
- Modify: `src/features/application/db/queries.ts`
- Create: `src/features/application/db/tagMutations.ts`
- Create: `src/features/application/actions/createTagAction.ts`
- Create: `src/features/application/actions/updateTagAction.ts`
- Create: `src/features/application/actions/deleteTagAction.ts`
- Create: `src/features/application/__tests__/tagMutations.test.ts`
- Create: `src/features/application/__tests__/tagActions.test.ts`

**Interfaces:**
- Produces: `listTags(executor, userId): Promise<TagRow[]>` where `TagRow = { id: string; name: string; color: string | null }`, ordered by name.
- Produces: `createTag(executor, { userId, name, color }): Promise<TagRow>`; `updateTag(executor, { userId, id, name, color }): Promise<TagRow | undefined>`; `deleteTag(executor, { userId, id }): Promise<{ id: string } | undefined>`.
- Produces actions: `createTagAction`, `updateTagAction`, `deleteTagAction` returning `TagActionResult`. Color is an optional `#rrggbb` string.

- [ ] **Step 1: Add `listTags` to queries.ts**

Append to `src/features/application/db/queries.ts` (import `tags` from the schema):

```typescript
import { tags } from '@/src/features/application/db/schema';

export type TagRow = { id: string; name: string; color: string | null };

/** A user's tags for the settings list, the detail tag picker, and the board filter options. */
export async function listTags(executor: DbExecutor, userId: string): Promise<TagRow[]> {
  return executor
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(asc(tags.name));
}
```

- [ ] **Step 2: Write the failing mutation tests**

Create `src/features/application/__tests__/tagMutations.test.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { tags } from '@/src/db/schema';
import { createTag, deleteTag, updateTag } from '@/src/features/application/db/tagMutations';
import { createUser } from '@/src/lib/vitest/helpers/db';

describe('tag mutations', () => {
  it('creates a tag with a color', async () => {
    const user = await createUser();

    const tag = await createTag(db, { userId: user.id, name: 'remote', color: '#89b4fa' });

    expect(tag.name).toBe('remote');
    expect(tag.color).toBe('#89b4fa');
  });

  it('rejects a duplicate name with a unique violation', async () => {
    const user = await createUser();
    await createTag(db, { userId: user.id, name: 'remote', color: null });

    await expect(createTag(db, { userId: user.id, name: 'remote', color: null })).rejects.toThrow();
  });

  it('updates an owned tag', async () => {
    const user = await createUser();
    const tag = await createTag(db, { userId: user.id, name: 'remote', color: null });

    const updated = await updateTag(db, {
      userId: user.id,
      id: tag.id,
      name: 'fully-remote',
      color: '#a6e3a1',
    });

    expect(updated?.name).toBe('fully-remote');
    expect(updated?.color).toBe('#a6e3a1');
  });

  it('deletes an owned tag', async () => {
    const user = await createUser();
    const tag = await createTag(db, { userId: user.id, name: 'remote', color: null });

    await deleteTag(db, { userId: user.id, id: tag.id });

    expect(await db.select().from(tags).where(eq(tags.id, tag.id))).toHaveLength(0);
  });

  it('returns undefined when updating a foreign tag', async () => {
    const owner = await createUser();
    const other = await createUser();
    const tag = await createTag(db, { userId: owner.id, name: 'remote', color: null });

    expect(
      await updateTag(db, { userId: other.id, id: tag.id, name: 'x', color: null }),
    ).toBeUndefined();
  });
});
```

- [ ] **Step 3: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/tagMutations.test.ts`
Expected: FAIL ("Cannot find module .../tagMutations").

- [ ] **Step 4: Implement the tag mutations**

Create `src/features/application/db/tagMutations.ts`:

```typescript
import 'server-only';

import { and, eq } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { tags } from '@/src/features/application/db/schema';
import { type TagRow } from '@/src/features/application/db/queries';

const RETURNING = { id: tags.id, name: tags.name, color: tags.color } as const;

/** Creates a user-owned tag. A duplicate name trips `tags_user_name_unique` (23505). */
export async function createTag(
  executor: DbExecutor,
  { userId, name, color }: { userId: string; name: string; color: string | null },
): Promise<TagRow> {
  const [row] = await executor.insert(tags).values({ userId, name, color }).returning(RETURNING);

  return row;
}

/** Updates an owned tag's name and color. Returns the row, or `undefined` when none matches. */
export async function updateTag(
  executor: DbExecutor,
  { userId, id, name, color }: { userId: string; id: string; name: string; color: string | null },
) {
  const rows = await executor
    .update(tags)
    .set({ name, color })
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning(RETURNING);

  return rows.at(0);
}

/** Deletes an owned tag (its `application_tags` rows cascade away). */
export async function deleteTag(
  executor: DbExecutor,
  { userId, id }: { userId: string; id: string },
) {
  const rows = await executor
    .delete(tags)
    .where(and(eq(tags.id, id), eq(tags.userId, userId)))
    .returning({ id: tags.id });

  return rows.at(0);
}
```

- [ ] **Step 5: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/tagMutations.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 6: Implement the three actions**

Create `src/features/application/actions/createTagAction.ts`:

```typescript
'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { createTag } from '@/src/features/application/db/tagMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type TagActionResult } from './types';

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

/** Creates a user tag. A duplicate name yields `errorTagNameTaken`. */
export const createTagAction = createServerAction({
  schema: () =>
    z.object({
      name: z.string().trim().min(1).max(50),
      color: z.string().regex(HEX_COLOR).nullish(),
    }),
  handler: async ({ name, color }): Promise<TagActionResult> => {
    const user = await requireUser();

    try {
      await createTag(db, { userId: user.id, name, color: color ?? null });
    } catch (error) {
      if (isUniqueViolation(error, 'tags_user_name_unique')) {
        return { status: 'error', errorKey: 'errorTagNameTaken' };
      }

      throw error;
    }

    return { status: 'success' };
  },
});
```

Create `src/features/application/actions/updateTagAction.ts` (same shape: schema `{ id, name, color }`, `updateTag`, missing => `errorTagNotFound`, dup => `errorTagNameTaken`).

Create `src/features/application/actions/deleteTagAction.ts` (schema `{ id }`, `deleteTag`, missing => `errorTagNotFound`).

- [ ] **Step 7: Write + run the action tests**

Create `src/features/application/__tests__/tagActions.test.ts` (sign-in harness). Assert: create succeeds; duplicate name => `errorTagNameTaken`; update of a foreign tag => `errorTagNotFound`; a non-hex color => `errorValidation`.

Run: `pnpm test src/features/application/__tests__/tagActions.test.ts`
Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/features/application
git commit -m "feat(be): tag list query + CRUD mutations and actions"
```

### Phase 2 verification

- [ ] Run `pnpm cleanup`, `pnpm test`, and `mcp__fallow__audit` over the changed files; fix or note what they surface.

---

## Phase 3 - FE: Settings screens (sub-stages + tags)

Fills the `settings/sub-stages` and `settings/tags` route stubs (currently `return null`). Sub-stages get CRUD plus drag-reorder (`@dnd-kit/react`); tags get CRUD with a color. FE here has no unit tests (the codebase tests are BE Vitest); each task ends with `pnpm cleanup` + a manual check in `pnpm dev`.

> **Pattern references (read before writing):** server page passing typed `ClientMessages[...]` props => `src/app/(app)/tracker-board/page.tsx`; client view => `src/features/application/views/TrackerBoardView.tsx`; VM hook calling an action + resolving errors => `src/features/job-hunt/view-models/useStartJobHuntVM.ts`; dialog form => `src/features/job-hunt/views/StartJobHuntDialogView.tsx` + `NameJobHuntDialogView.tsx`; error resolution => `src/lib/next-intl/utils/resolveErrorMessage.ts`.

### Task 3.1: Install `@dnd-kit/helpers` and add the settings i18n namespaces

**Files:**
- Modify: `package.json` (via `pnpm add`)
- Modify: `src/lib/next-intl/messages/en-US/client.json`
- Modify: `src/lib/next-intl/messages/vi-VN/client.json`

**Interfaces:**
- Produces: a `settings` client namespace with `subStages` and `tags` sub-trees (labels + the action error strings keyed by the Phase 2 error keys), available on `ClientMessages`.

- [ ] **Step 1: Install the dnd reorder helper**

Run: `pnpm add @dnd-kit/helpers`
Expected: adds `@dnd-kit/helpers` (the official companion that provides `move(array, event)` for sortable reordering).

- [ ] **Step 2: Add the `settings` namespace (en-US)**

In `src/lib/next-intl/messages/en-US/client.json`, add a top-level `settings` namespace:

```json
"settings": {
  "subStages": {
    "title": "Sub-stages",
    "description": "Pipeline chips for the Active and Final Stages columns. Drag to reorder.",
    "stages": { "active": "Active", "final_stages": "Final Stages" },
    "addLabel": "Add sub-stage",
    "namePlaceholder": "e.g. Tech screen",
    "rename": "Rename",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "empty": "No sub-stages yet",
    "deleteConfirm": "Delete this sub-stage? Applications using it keep their stage but lose the chip.",
    "errors": {
      "errorSubStageNameTaken": "You already have a sub-stage with that name in this stage.",
      "errorSubStageNotFound": "That sub-stage no longer exists."
    }
  },
  "tags": {
    "title": "Tags",
    "description": "Free-form labels for filtering the board.",
    "addLabel": "Add tag",
    "namePlaceholder": "e.g. remote",
    "colorLabel": "Color",
    "rename": "Edit",
    "delete": "Delete",
    "save": "Save",
    "cancel": "Cancel",
    "empty": "No tags yet",
    "deleteConfirm": "Delete this tag? It is removed from every application.",
    "errors": {
      "errorTagNameTaken": "You already have a tag with that name.",
      "errorTagNotFound": "That tag no longer exists."
    }
  }
}
```

- [ ] **Step 3: Add the mirror to vi-VN**

Add the same key shape to `src/lib/next-intl/messages/vi-VN/client.json` with Vietnamese copy (mirror every leaf; the CI overlap/parity guard fails otherwise).

- [ ] **Step 4: Regenerate + typecheck**

Run: `pnpm i18n:generate && pnpm typecheck`
Expected: PASS (the `settings` namespace is now on `ClientMessages`).

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/next-intl/messages
git commit -m "chore(fe): add @dnd-kit/helpers and settings i18n namespaces"
```

### Task 3.2: Sub-stages settings - server page, view, and CRUD VM

**Files:**
- Modify: `src/app/(app)/settings/sub-stages/page.tsx`
- Create: `src/features/application/views/SubStagesView.tsx`
- Create: `src/features/application/components/SubStageRow.tsx`
- Create: `src/features/application/view-models/useSubStageCrudVM.ts`

**Interfaces:**
- Consumes: `listSubStages` (Task 2.2), `createSubStageAction`/`renameSubStageAction`/`deleteSubStageAction` (Task 2.2), `ClientMessages['settings']['subStages']`, `SubStageRow` type.
- Produces: `SubStagesView({ messages, subStages }: { messages; subStages: SubStageRow[] })`; `useSubStageCrudVM(messages)` exposing `{ create, rename, remove, isPending }` (each calls its action, resolves `errorKey` via `resolveErrorMessage`, toasts on error, `router.refresh()` on success).

- [ ] **Step 1: Wire the server page**

Replace the body of `src/app/(app)/settings/sub-stages/page.tsx` (keep `generateMetadata`):

```typescript
import { db } from '@/src/db/client';
import { listSubStages } from '@/src/features/application/db/queries';
import { SubStagesView } from '@/src/features/application/views/SubStagesView';
import { requireUser } from '@/src/lib/better-auth/session';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

// ...generateMetadata unchanged...

export default async function SubStages() {
  const user = await requireUser();
  const [subStages, messages] = await Promise.all([
    listSubStages(db, user.id),
    getClientMessages(),
  ]);

  return <SubStagesView messages={messages.settings.subStages} subStages={subStages} />;
}
```

- [ ] **Step 2: Build the CRUD VM**

Create `src/features/application/view-models/useSubStageCrudVM.ts` modeled on `useStartJobHuntVM` (useTransition + action call + `resolveErrorMessage` + `toast` + `router.refresh()`). Resolve errors against `messages.errors` (typed `Record<SubStageErrorKey, string>`):

```typescript
'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createSubStageAction } from '@/src/features/application/actions/createSubStageAction';
import { deleteSubStageAction } from '@/src/features/application/actions/deleteSubStageAction';
import { renameSubStageAction } from '@/src/features/application/actions/renameSubStageAction';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { toast } from '@/src/lib/sonner/toast';

type SubStageMessages = ClientMessages['settings']['subStages'];
type Stage = 'active' | 'final_stages';

export function useSubStageCrudVM(messages: SubStageMessages) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (action: () => Promise<{ status: 'success' } | { status: 'error'; errorKey: keyof SubStageMessages['errors'] | 'errorGeneric' | 'errorValidation' }>) =>
    new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await action();
        if (result.status === 'error') {
          toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));
          resolve(false);
          return;
        }
        router.refresh();
        resolve(true);
      });
    });

  return {
    isPending,
    create: (stage: Stage, name: string) => run(() => createSubStageAction({ stage, name })),
    rename: (id: string, name: string) => run(() => renameSubStageAction({ id, name })),
    remove: (id: string) => run(() => deleteSubStageAction({ id })),
  };
}
```

- [ ] **Step 3: Build the view + row**

Create `SubStagesView.tsx`: a `'use client'` component that renders the title/description via Typography (`H3`/`Muted` or the available primitives), then two sections (one per stage in `['active','final_stages']`), each listing its `subStages` (filtered by stage, already sorted) as `SubStageRow` items, plus an inline "Add sub-stage" affordance (an `Input` + add `Button`, or the `addLabel` button opening an inline field) that calls `vm.create(stage, name)`. Empty sections render `messages.empty`.

Create `SubStageRow.tsx`: shows the sub-stage name with a rename affordance (inline `Input` toggled by a "Rename" button, calling `vm.rename(id, name)`) and a delete button (confirm via the existing `AlertDialog` primitive using `messages.deleteConfirm`, calling `vm.remove(id)`). Reuse `Button`, `Input`, `Field`/`FieldError`, and Typography primitives. Disable controls while `vm.isPending`.

(Drag handles are added in Task 3.3; build this task with static rows first.)

- [ ] **Step 4: Verify**

Run: `pnpm cleanup`
Then `pnpm dev` and visit `/settings/sub-stages`: add, rename, and delete sub-stages under both columns; confirm a duplicate name surfaces the `errorSubStageNameTaken` toast and the list refreshes after each change.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(app\)/settings/sub-stages src/features/application
git commit -m "feat(fe): sub-stages settings screen with CRUD"
```

### Task 3.3: Sub-stage drag-reorder (`@dnd-kit/react`)

**Files:**
- Modify: `src/features/application/views/SubStagesView.tsx`
- Modify: `src/features/application/components/SubStageRow.tsx`
- Create: `src/features/application/view-models/useSubStageReorderVM.ts`

**Interfaces:**
- Consumes: `reorderSubStagesAction` (Task 2.3), `useSortable` from `@dnd-kit/react/sortable`, `DragDropProvider` from `@dnd-kit/react`, `move` from `@dnd-kit/helpers`.
- Produces: per-stage optimistic ordering that persists on drop.

> **Read first:** `@dnd-kit/react` sortable usage. Key API at v0.5: wrap the list region in `<DragDropProvider onDragEnd={...}>`; each row calls `const { ref, isDragging } = useSortable({ id, index, group: stage })` and spreads `ref` on its root element; reorder the local array with `move(items, event)` from `@dnd-kit/helpers` inside `onDragOver`/`onDragEnd`.

- [ ] **Step 1: Build the reorder VM**

Create `useSubStageReorderVM.ts`: holds the optimistic per-stage order in `useState` (seeded from props, re-seeded when props change), exposes `items` and an `onDragEnd(event)` that (a) computes the next order with `move(currentItems, event)`, (b) sets it optimistically, and (c) calls `reorderSubStagesAction({ stage, orderedIds: next.map(s => s.id) })`, reverting + toasting on error and `router.refresh()` on success. One provider/VM instance per stage section.

```typescript
'use client';

import { useEffect, useState, useTransition } from 'react';

import { move } from '@dnd-kit/helpers';
import { useRouter } from 'next/navigation';

import { reorderSubStagesAction } from '@/src/features/application/actions/reorderSubStagesAction';
import { type SubStageRow } from '@/src/features/application/db/queries';
import { toast } from '@/src/lib/sonner/toast';

type Stage = 'active' | 'final_stages';

export function useSubStageReorderVM(stage: Stage, initial: SubStageRow[], errorMessage: string) {
  const [items, setItems] = useState(initial);
  const [, startTransition] = useTransition();
  const router = useRouter();

  // Re-seed when the server data changes (after a refresh).
  useEffect(() => {
    setItems(initial);
  }, [initial]);

  const onDragEnd = (event: Parameters<typeof move<SubStageRow>>[1]) => {
    const next = move(items, event);
    if (next === items) {
      return;
    }
    setItems(next);
    startTransition(async () => {
      const result = await reorderSubStagesAction({ stage, orderedIds: next.map((s) => s.id) });
      if (result.status === 'error') {
        setItems(initial);
        toast.error(errorMessage);
        return;
      }
      router.refresh();
    });
  };

  return { items, onDragEnd };
}
```

- [ ] **Step 2: Wire the provider + sortable rows**

In `SubStagesView.tsx`, wrap each stage section's list in `<DragDropProvider onDragEnd={vm.onDragEnd}>` and map `vm.items` to `SubStageRow`s passing `index`. In `SubStageRow.tsx`, call `useSortable({ id, index, group: stage })` and spread `ref` on the row root, adding a drag-handle button (Tabler `IconGripVertical`) and an `isDragging` style.

- [ ] **Step 3: Verify**

Run: `pnpm cleanup`
Then `pnpm dev`: drag to reorder sub-stages within a column; confirm the order survives a refresh (persisted `sort_order`). Confirm cross-column dragging is not possible (each provider is scoped to one stage).

- [ ] **Step 4: Commit**

```bash
git add src/features/application
git commit -m "feat(fe): drag-reorder sub-stages in settings"
```

### Task 3.4: Tags settings - server page, view, and CRUD VM

**Files:**
- Modify: `src/app/(app)/settings/tags/page.tsx`
- Create: `src/features/application/views/TagsView.tsx`
- Create: `src/features/application/components/TagRow.tsx`
- Create: `src/features/application/view-models/useTagCrudVM.ts`

**Interfaces:**
- Consumes: `listTags` (Task 2.4), `createTagAction`/`updateTagAction`/`deleteTagAction`, `ClientMessages['settings']['tags']`, `TagRow` type.
- Produces: `TagsView({ messages, tags })`; `useTagCrudVM(messages)` exposing `{ create, update, remove, isPending }` (same shape as the sub-stage VM, resolving `TagErrorKey`).

- [ ] **Step 1: Wire the server page**

Mirror Task 3.2 Step 1 in `settings/tags/page.tsx`: `requireUser`, `listTags(db, user.id)`, `getClientMessages`, render `<TagsView messages={messages.settings.tags} tags={tags} />`.

- [ ] **Step 2: Build the CRUD VM**

Create `useTagCrudVM.ts` cloning `useSubStageCrudVM` (Task 3.2 Step 2) but calling the tag actions and resolving `messages.errors` (typed `Record<TagErrorKey, ...>`): `create(name, color)`, `update(id, name, color)`, `remove(id)`.

- [ ] **Step 3: Build the view + row**

Create `TagsView.tsx`: title/description via Typography, a list of `TagRow`s, and an add affordance (name `Input` + a color picker + add `Button`) calling `vm.create(name, color)`. For the color picker use a native `<input type="color">` styled small, or a fixed swatch palette of Catppuccin tokens; store the `#rrggbb` value. Empty list renders `messages.empty`.

Create `TagRow.tsx`: a color swatch (`span` with `style={{ backgroundColor: color }}`, falling back to `bg-muted-foreground` when null) + the tag name, an edit affordance (inline name + color, `vm.update`), and a delete button (`AlertDialog`, `messages.deleteConfirm`, `vm.remove`).

- [ ] **Step 4: Verify**

Run: `pnpm cleanup`
Then `pnpm dev` at `/settings/tags`: create a tag with a color, edit its name/color, delete it; confirm a duplicate name surfaces `errorTagNameTaken`.

- [ ] **Step 5: Commit**

```bash
git add src/app/\(app\)/settings/tags src/features/application
git commit -m "feat(fe): tags settings screen with CRUD"
```

### Phase 3 verification

- [ ] Run `pnpm cleanup`, `pnpm test`, and `mcp__fallow__audit`; fix or note findings. Manually confirm both settings screens.

---

## Phase 4 - FE: Application detail (modal + full page)

Implements the ClickUp-style detail surface (ADR-0008): soft-nav opens a **Dialog modal** over the board; hard-load/refresh of the same URL renders a **full page** inside the app shell. Both server-fetch the detail and stream a **skeleton** (Suspense). The detail's editing controls call the Phase 1 actions and the Phase 2 lists. Resume + event slots are static placeholders (features 3 & 4).

> **Read first:** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/parallel-routes.md` and `intercepting-routes.md` (already summarized in the spec); Lexical basics at `@lexical/react` (LexicalComposer, RichTextPlugin, ContentEditable, HistoryPlugin, ListPlugin, OnChangePlugin, `$getRoot`, `editor.parseEditorState`, `editorState.toJSON()`).

### Task 4.1: Detail + activity queries

**Files:**
- Modify: `src/features/application/db/queries.ts`
- Create: `src/features/application/__tests__/detailQueries.test.ts`

**Interfaces:**
- Produces: `getApplicationDetail(executor, userId, applicationId): Promise<ApplicationDetail | null>` (null when missing or not owned) where `ApplicationDetail` carries every editable column + `tagIds: string[]` + `readOnly: boolean` (true when the owning hunt is ended).
- Produces: `getApplicationActivity(executor, applicationId): Promise<ActivityEntry[]>` (newest first) where `ActivityEntry = { id: string; type: ActivityType; metadata: unknown; occurredAt: Date }`.

- [ ] **Step 1: Write the failing query tests**

Create `src/features/application/__tests__/detailQueries.test.ts`:

```typescript
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { applications } from '@/src/db/schema';
import {
  getApplicationActivity,
  getApplicationDetail,
} from '@/src/features/application/db/queries';
import { createApplication } from '@/src/features/application/db/mutations';
import { createJobHunt, createUser } from '@/src/lib/vitest/helpers/db';

describe('getApplicationDetail', () => {
  it('returns the detail with tagIds and readOnly=false for an active hunt', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng', notes: 'hi' })
      .returning();

    const detail = await getApplicationDetail(db, user.id, app.id);

    expect(detail?.company).toBe('Acme');
    expect(detail?.notes).toBe('hi');
    expect(detail?.tagIds).toEqual([]);
    expect(detail?.readOnly).toBe(false);
  });

  it('flags readOnly=true for an ended hunt', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id, { status: 'ended' });
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    expect((await getApplicationDetail(db, user.id, app.id))?.readOnly).toBe(true);
  });

  it('returns null for a foreign application', async () => {
    const owner = await createUser();
    const other = await createUser();
    const hunt = await createJobHunt(owner.id);
    const [app] = await db
      .insert(applications)
      .values({ jobHuntId: hunt.id, company: 'Acme', role: 'Eng' })
      .returning();

    expect(await getApplicationDetail(db, other.id, app.id)).toBeNull();
  });

  it('returns the activity log newest-first', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);
    const { id } = await createApplication(db, {
      jobHuntId: hunt.id,
      company: 'Acme',
      role: 'Eng',
      stage: 'active',
    });

    const activity = await getApplicationActivity(db, id);

    expect(activity.map((a) => a.type)).toContain('created');
    expect(activity.map((a) => a.type)).toContain('response_received');
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/detailQueries.test.ts`
Expected: FAIL ("getApplicationDetail is not a function").

- [ ] **Step 3: Implement the queries**

Append to `src/features/application/db/queries.ts` (add `applicationTags` to the schema import, `activityLog` from `@/src/features/activity/db/schema`, `jobHunts` from `@/src/features/job-hunt/db/schema`, and the display-enum types from `../types`):

```typescript
import { activityLog } from '@/src/features/activity/db/schema';
import { applicationTags } from '@/src/features/application/db/schema';
import { jobHunts } from '@/src/features/job-hunt/db/schema';
import {
  type ApplicationSource,
  type BoardStage,
  type ClosedOutcome,
  type WorkingModel,
} from '@/src/features/application/types';

type ActivityType = (typeof activityLog.type.enumValues)[number];

export type ApplicationDetail = {
  id: string;
  jobHuntId: string;
  company: string;
  role: string;
  stage: BoardStage;
  subStageId: string | null;
  favorite: boolean;
  source: ApplicationSource | null;
  jdUrl: string | null;
  jdText: string | null;
  location: string | null;
  workingModel: WorkingModel | null;
  salaryMin: number | null;
  salaryMax: number | null;
  salaryCurrency: string | null;
  notes: string | null;
  closedOutcome: ClosedOutcome | null;
  closedAt: Date | null;
  appliedAt: Date;
  tagIds: string[];
  readOnly: boolean;
};

export type ActivityEntry = {
  id: string;
  type: ActivityType;
  metadata: unknown;
  occurredAt: Date;
};

/**
 * Full editable detail for one application the user owns (ownership via the hunt join), plus
 * its assigned tag ids and a `readOnly` flag set when the owning hunt has ended. Returns `null`
 * when the application is missing or not the caller's.
 */
export async function getApplicationDetail(
  executor: DbExecutor,
  userId: string,
  applicationId: string,
): Promise<ApplicationDetail | null> {
  const [row] = await executor
    .select({
      id: applications.id,
      jobHuntId: applications.jobHuntId,
      company: applications.company,
      role: applications.role,
      stage: applications.stage,
      subStageId: applications.subStageId,
      favorite: applications.favorite,
      source: applications.source,
      jdUrl: applications.jdUrl,
      jdText: applications.jdText,
      location: applications.location,
      workingModel: applications.workingModel,
      salaryMin: applications.salaryMin,
      salaryMax: applications.salaryMax,
      salaryCurrency: applications.salaryCurrency,
      notes: applications.notes,
      closedOutcome: applications.closedOutcome,
      closedAt: applications.closedAt,
      appliedAt: applications.appliedAt,
      huntStatus: jobHunts.status,
    })
    .from(applications)
    .innerJoin(jobHunts, eq(applications.jobHuntId, jobHunts.id))
    .where(and(eq(applications.id, applicationId), eq(jobHunts.userId, userId)));

  if (!row) {
    return null;
  }

  const tagRows = await executor
    .select({ tagId: applicationTags.tagId })
    .from(applicationTags)
    .where(eq(applicationTags.applicationId, applicationId));

  const { huntStatus, ...rest } = row;

  return { ...rest, tagIds: tagRows.map((t) => t.tagId), readOnly: huntStatus === 'ended' };
}

/** An application's activity timeline, newest first, for the detail surface. */
export async function getApplicationActivity(
  executor: DbExecutor,
  applicationId: string,
): Promise<ActivityEntry[]> {
  return executor
    .select({
      id: activityLog.id,
      type: activityLog.type,
      metadata: activityLog.metadata,
      occurredAt: activityLog.occurredAt,
    })
    .from(activityLog)
    .where(eq(activityLog.applicationId, applicationId))
    .orderBy(desc(activityLog.occurredAt));
}
```

- [ ] **Step 4: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/detailQueries.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/features/application
git commit -m "feat(be): application detail + activity timeline queries"
```

### Task 4.2: `applicationDetail` + `activity` i18n namespaces

**Files:**
- Modify: `src/lib/next-intl/messages/en-US/client.json`
- Modify: `src/lib/next-intl/messages/vi-VN/client.json`

- [ ] **Step 1: Add the namespaces (en-US)**

Add two top-level namespaces. `applicationDetail` holds field labels, picker labels, the close label, the read-only banner, the static resume/event slot placeholders, and a `saved`/error toast; `activity` holds the timeline templates + localized stage/outcome names:

```json
"applicationDetail": {
  "close": "Close",
  "readOnlyBanner": "This hunt has ended. The application is read-only.",
  "fields": {
    "company": "Company",
    "role": "Role",
    "source": "Source",
    "jdUrl": "Job posting URL",
    "jdText": "Job description",
    "location": "Location",
    "workingModel": "Working model",
    "salaryMin": "Salary min",
    "salaryMax": "Salary max",
    "salaryCurrency": "Currency",
    "notes": "Notes"
  },
  "workingModels": { "remote": "Remote", "hybrid": "Hybrid", "onsite": "Onsite" },
  "subStage": { "label": "Sub-stage", "placeholder": "No sub-stage", "none": "None" },
  "tags": { "label": "Tags", "placeholder": "Add tags" },
  "save": "Save",
  "saved": "Saved",
  "timelineTitle": "Activity",
  "slots": { "resume": "Resume picker (coming soon)", "events": "Events (coming soon)" },
  "errors": {
    "errorApplicationNotFound": "We couldn't find that application.",
    "errorSubStageInvalid": "That sub-stage isn't valid for this stage.",
    "errorTagInvalid": "One of those tags is no longer available."
  }
},
"activity": {
  "created": "Application created",
  "stage_change": "Moved from {from} to {to}",
  "sub_stage_change": "Sub-stage set to {to}",
  "sub_stage_cleared": "Sub-stage cleared",
  "note_added": "Note added",
  "response_received": "Response received",
  "offer_received": "Offer received",
  "event_scheduled": "Event scheduled",
  "event_completed": "Event completed",
  "event_cancelled": "Event cancelled",
  "resume_changed": "Resume changed",
  "closed": "Closed as {outcome}",
  "stages": { "applied": "Applied", "active": "Active", "final_stages": "Final Stages", "closed": "Closed" },
  "outcomes": { "rejected": "rejected", "withdrawn": "withdrawn", "accepted": "accepted", "ghosted": "ghosted" }
}
```

- [ ] **Step 2: Mirror in vi-VN, regenerate, typecheck**

Add the same shape with Vietnamese copy. Run: `pnpm i18n:generate && pnpm typecheck`
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add src/lib/next-intl/messages
git commit -m "feat(fe): application detail + activity i18n namespaces"
```

### Task 4.3: Routing scaffolding + shared `ApplicationDetail` server component + skeleton

**Files:**
- Create: `src/app/(app)/tracker-board/layout.tsx`
- Create: `src/app/(app)/tracker-board/@modal/default.tsx`
- Create: `src/app/(app)/tracker-board/@modal/(.)[applicationId]/page.tsx`
- Create: `src/app/(app)/tracker-board/[applicationId]/page.tsx`
- Create: `src/features/application/components/ApplicationDetail.tsx`
- Create: `src/features/application/components/ApplicationDetailModal.tsx`
- Create: `src/features/application/components/ApplicationDetailSkeleton.tsx`

**Interfaces:**
- Consumes: `getApplicationDetail`, `getApplicationActivity`, `listSubStages`, `listTags`, `getClientMessages`, `requireUser`, `notFound`.
- Produces: `ApplicationDetail({ applicationId, variant }: { applicationId: string; variant: 'modal' | 'page' })` (async server component) rendering `ApplicationDetailView` with all props; `ApplicationDetailModal` (client Dialog host closing via `router.back()`); `ApplicationDetailSkeleton`.

- [ ] **Step 1: Add the tracker-board layout with the modal slot**

Create `src/app/(app)/tracker-board/layout.tsx`:

```typescript
import { type ReactNode } from 'react';

// Parallel `@modal` slot hosts the intercepted detail Dialog over the board (soft-nav). On a
// hard load the slot resolves to default.tsx (null) and `[applicationId]/page.tsx` renders the
// full page instead. See ADR-0008.
export default function TrackerBoardLayout({
  children,
  modal,
}: {
  children: ReactNode;
  modal: ReactNode;
}) {
  return (
    <>
      {children}
      {modal}
    </>
  );
}
```

- [ ] **Step 2: Add the modal default (null fallback)**

Create `src/app/(app)/tracker-board/@modal/default.tsx`:

```typescript
export default function Default() {
  return null;
}
```

- [ ] **Step 3: Add the shared server component + skeleton**

Create `src/features/application/components/ApplicationDetail.tsx`:

```typescript
import { notFound } from 'next/navigation';

import { db } from '@/src/db/client';
import {
  getApplicationActivity,
  getApplicationDetail,
  listSubStages,
  listTags,
} from '@/src/features/application/db/queries';
import { ApplicationDetailView } from '@/src/features/application/views/ApplicationDetailView';
import { requireUser } from '@/src/lib/better-auth/session';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

type ApplicationDetailProps = { applicationId: string; variant: 'modal' | 'page' };

/**
 * Server-fetches one application's full detail (after an ownership check), its activity
 * timeline, and the user's sub-stages/tags for the pickers, then hands typed props to the
 * client editing view. Rendered inside a Suspense boundary so the modal/page streams a skeleton
 * while this resolves.
 */
export async function ApplicationDetail({ applicationId, variant }: ApplicationDetailProps) {
  const user = await requireUser();
  const detail = await getApplicationDetail(db, user.id, applicationId);

  if (!detail) {
    notFound();
  }

  const [activity, subStages, tags, messages] = await Promise.all([
    getApplicationActivity(db, applicationId),
    listSubStages(db, user.id),
    listTags(db, user.id),
    getClientMessages(),
  ]);

  return (
    <ApplicationDetailView
      variant={variant}
      detail={detail}
      activity={activity}
      subStages={subStages}
      tags={tags}
      messages={messages.applicationDetail}
      activityMessages={messages.activity}
      sourceMessages={messages.trackerBoard.sources}
    />
  );
}
```

Create `ApplicationDetailSkeleton.tsx`: a layout-matching skeleton using the `Skeleton` primitive (`src/components/ui/Skeleton`) - a title bar, a few field blocks, and a timeline column. Export `ApplicationDetailSkeleton`.

- [ ] **Step 4: Add the modal Dialog host**

Create `src/features/application/components/ApplicationDetailModal.tsx`:

```typescript
'use client';

import { type PropsWithChildren } from 'react';

import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/src/components/ui/Dialog';

/**
 * Client host for the intercepted detail route: a controlled Dialog that opens on mount and,
 * when dismissed (close button / Escape / overlay), navigates back to the board via
 * `router.back()` so the URL returns to `/tracker-board` and the modal slot resets to default.
 */
export function ApplicationDetailModal({ children }: PropsWithChildren) {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogContent className='max-h-[85vh] w-full max-w-3xl overflow-y-auto'>
        {children}
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 5: Add the intercept route (modal)**

Create `src/app/(app)/tracker-board/@modal/(.)[applicationId]/page.tsx`:

```typescript
import { Suspense } from 'react';

import { ApplicationDetail } from '@/src/features/application/components/ApplicationDetail';
import { ApplicationDetailModal } from '@/src/features/application/components/ApplicationDetailModal';
import { ApplicationDetailSkeleton } from '@/src/features/application/components/ApplicationDetailSkeleton';

type InterceptedDetailProps = { params: Promise<{ applicationId: string }> };

export default async function InterceptedApplicationDetail({ params }: InterceptedDetailProps) {
  const { applicationId } = await params;

  return (
    <ApplicationDetailModal>
      <Suspense fallback={<ApplicationDetailSkeleton />}>
        <ApplicationDetail applicationId={applicationId} variant='modal' />
      </Suspense>
    </ApplicationDetailModal>
  );
}
```

- [ ] **Step 6: Add the full-page route**

Create `src/app/(app)/tracker-board/[applicationId]/page.tsx`:

```typescript
import { Suspense } from 'react';

import { ApplicationDetail } from '@/src/features/application/components/ApplicationDetail';
import { ApplicationDetailSkeleton } from '@/src/features/application/components/ApplicationDetailSkeleton';

type ApplicationDetailPageProps = { params: Promise<{ applicationId: string }> };

export default async function ApplicationDetailPage({ params }: ApplicationDetailPageProps) {
  const { applicationId } = await params;

  return (
    <Suspense fallback={<ApplicationDetailSkeleton />}>
      <ApplicationDetail applicationId={applicationId} variant='page' />
    </Suspense>
  );
}
```

- [ ] **Step 7: Temporary view stub + verify routing**

Create a minimal `src/features/application/views/ApplicationDetailView.tsx` stub (`'use client'`) that renders `detail.company` + `detail.role` and a close control (Task 4.4 fleshes it out), so the routes compile.

Run: `pnpm cleanup`
Then `pnpm dev`: from the board, soft-navigate to `/tracker-board/<id>` (Task 4.6 wires the card link; for now visit the URL) - hard-load shows the full page; once card links exist, clicking shows the modal. Confirm an unknown id renders `not-found`.

- [ ] **Step 8: Commit**

```bash
git add src/app/\(app\)/tracker-board src/features/application
git commit -m "feat(fe): intercepting-route modal + full-page detail scaffolding (ADR-0008)"
```

### Task 4.4: `ApplicationDetailView` shell - header, close, read-only, slots

**Files:**
- Modify: `src/features/application/views/ApplicationDetailView.tsx`

**Interfaces:**
- Consumes: `ApplicationDetail`, `ActivityEntry`, `SubStageRow`, `TagRow` types; `ClientMessages['applicationDetail' | 'activity']`; `ClientMessages['trackerBoard']['sources']`. Props: `{ variant: 'modal' | 'page'; detail; activity; subStages; tags; messages; activityMessages; sourceMessages }`.
- Produces: the composed detail layout. Editing sub-components are added in Tasks 4.5-4.7; the timeline in 4.8.

- [ ] **Step 1: Build the shell**

Replace the stub with the full layout: a header row (company as `H3`, role as `Muted`, the existing favorite star via `useToggleFavorite`, and a close control), an optional read-only banner (`detail.readOnly` => `messages.readOnlyBanner`, and pass `readOnly` down so every editing control is disabled), a two-column body (left: metadata form + sub-stage + tags + notes + the static resume/event slot placeholders rendering `messages.slots.resume` / `messages.slots.events`; right: the activity timeline), and the close control: when `variant === 'page'`, a `next/link` `<Link href={\`/tracker-board?job_hunt=${detail.jobHuntId}\`}>` styled as an icon button; when `variant === 'modal'`, a `DialogClose` (from `@/src/components/ui/Dialog`) so dismissal flows through the modal host's `router.back()`. Use Typography primitives for all text; name props `ApplicationDetailViewProps`.

- [ ] **Step 2: Verify + commit**

Run: `pnpm cleanup`, then `pnpm dev` to confirm both variants render the shell, the close control returns to the board, and the read-only banner shows for an ended hunt's application.

```bash
git add src/features/application
git commit -m "feat(fe): application detail view shell with close + read-only"
```

### Task 4.5: Metadata form (`updateApplicationAction`) + Lexical notes

**Files:**
- Create: `src/features/application/components/ApplicationMetadataForm.tsx`
- Create: `src/features/application/components/NotesEditor.tsx`
- Create: `src/features/application/view-models/useUpdateApplicationVM.ts`
- Modify: `src/features/application/views/ApplicationDetailView.tsx`

**Interfaces:**
- Consumes: `updateApplicationAction`; `useForm` (`@/src/lib/form/hooks/useForm`); `FormTextField`; the source/working-model enums; `ClientMessages['applicationDetail']`.
- Produces: `ApplicationMetadataForm({ detail, messages, sourceMessages, readOnly })` (one RHF form over the editable metadata incl. notes, saved via `updateApplicationAction`); `NotesEditor({ value, onChange, readOnly })` (Lexical, controlled, emitting serialized JSON or `null` when empty); `useUpdateApplicationVM(detail, messages)`.

- [ ] **Step 1: Build the update VM**

Create `useUpdateApplicationVM.ts` modeled on `useStartJobHuntVM`: `useForm` with `defaultValues` from `detail` (company, role, source, jdUrl, jdText, location, workingModel, salaryMin/Max/Currency, notes), an `onSubmit` that calls `updateApplicationAction({ id: detail.id, ...values })`, resolves errors via `resolveErrorMessage(t, messages.errors, result.errorKey)` + `toast`, and on success `toast.success(messages.saved)` + `router.refresh()`. Numeric fields: coerce empty string to `null` and strings to numbers before sending (the action schema expects `number | null`).

- [ ] **Step 2: Build the Lexical notes editor**

Create `NotesEditor.tsx` (`'use client'`): a controlled Lexical editor. Read first: `@lexical/react` `LexicalComposer`, `RichTextPlugin` + `ContentEditable`, `HistoryPlugin`, `ListPlugin`, `OnChangePlugin`. Config: `initialConfig.editorState` = `value` (a serialized JSON string) when present, else undefined; `nodes: [ListNode, ListItemNode]`; `editable: !readOnly`. A small toolbar dispatches `FORMAT_TEXT_COMMAND` for bold/italic/underline and `INSERT_UNORDERED_LIST_COMMAND` for bullets. In `OnChangePlugin`'s `onChange(editorState)`: if `editorState.read(() => $getRoot().getTextContent().trim()) === ''` call `onChange(null)`, else `onChange(JSON.stringify(editorState.toJSON()))`. This null-on-empty contract is what makes `updateApplication`'s `note_added` empty=>non-empty rule correct.

- [ ] **Step 3: Build the metadata form**

Create `ApplicationMetadataForm.tsx`: wire `useUpdateApplicationVM`; render `FormTextField`s for company/role/jdUrl/location/salary fields, a source `Combobox` (single-select over the `applicationSource` enum, labels from `sourceMessages`), a working-model `Combobox` (labels from `messages.workingModels`), a `Textarea` (`@/src/components/ui/Textarea`) for `jdText`, and the `NotesEditor` bound through an RHF `Controller` (`name='notes'`). A `Save` button (`messages.save`, `loading={isPending}`). All inputs `disabled` when `readOnly`.

- [ ] **Step 4: Mount in the view + verify**

Render `ApplicationMetadataForm` in the left column of `ApplicationDetailView`. Run `pnpm cleanup`, then `pnpm dev`: edit metadata and notes, Save, confirm persistence after refresh; confirm adding a first note shows a `note_added` entry in the timeline (after Task 4.8), and that re-saving notes does not add another.

- [ ] **Step 5: Commit**

```bash
git add src/features/application
git commit -m "feat(fe): application metadata form with Lexical notes"
```

### Task 4.6: Sub-stage picker + tag assignment

**Files:**
- Create: `src/features/application/components/SubStagePicker.tsx`
- Create: `src/features/application/components/TagPicker.tsx`
- Create: `src/features/application/view-models/useSetSubStageVM.ts`
- Create: `src/features/application/view-models/useSetTagsVM.ts`
- Modify: `src/features/application/views/ApplicationDetailView.tsx`

**Interfaces:**
- Consumes: `setSubStageAction`, `setTagsAction`; the user's `subStages`/`tags` lists; `ClientMessages['applicationDetail']`.
- Produces: `SubStagePicker` (single-select Combobox, shown only for `active`/`final_stages`, filtered to the app's stage; `null` clears); `TagPicker` (multi-select Combobox chips over the user's tags). Each is an immediate-commit control (no form/save) calling its action + `router.refresh()`, optimistic where simple.

- [ ] **Step 1: Build the two VMs**

`useSetSubStageVM(detail)`: a `set(subStageId: string | null)` that calls `setSubStageAction({ id: detail.id, subStageId })` inside `useTransition`, toasts the resolved error or `router.refresh()` on success. `useSetTagsVM(detail)`: a `set(tagIds: string[])` calling `setTagsAction({ id: detail.id, tagIds })` likewise.

- [ ] **Step 2: Build the pickers**

`SubStagePicker.tsx`: render only when `detail.stage === 'active' || detail.stage === 'final_stages'`. A `Combobox` single-select over `subStages.filter((s) => s.stage === detail.stage)`, value = `detail.subStageId`, with a "None" option that calls `set(null)`. Disabled when `readOnly`.

`TagPicker.tsx`: a multi-select `Combobox` with `ComboboxChips`/`ComboboxChip` (see `src/components/ui/Combobox`), options = the user's `tags`, value = `detail.tagIds`; on change call `set(nextTagIds)`. Disabled when `readOnly`.

- [ ] **Step 3: Mount + verify + commit**

Render both in the view. Run `pnpm cleanup`, then `pnpm dev`: set/clear a sub-stage on an active app (confirm a `sub_stage_change` timeline entry); assign/remove tags (confirm no timeline entry, and the board card chips update after refresh).

```bash
git add src/features/application
git commit -m "feat(fe): sub-stage picker + tag assignment in detail"
```

### Task 4.7: Activity timeline

**Files:**
- Create: `src/features/application/components/ActivityTimeline.tsx`
- Create: `src/features/application/utils/activityLabel.ts`
- Modify: `src/features/application/views/ApplicationDetailView.tsx`

**Interfaces:**
- Consumes: `ActivityEntry[]`, `ClientMessages['activity']`, `formatDate` (`@/src/lib/formatter/date`), `useLocale`.
- Produces: `activityLabel(entry, messages): string` (maps `type` + `metadata` to a localized line, interpolating localized stage/outcome names; `sub_stage_change` with `to === null` uses `sub_stage_cleared`); `ActivityTimeline({ activity, messages })` rendering the entries with timestamps.

- [ ] **Step 1: Build the label mapper**

Create `activityLabel.ts`: a pure function switching on `entry.type`. For `stage_change` interpolate `messages.stages[from]`/`[to]`; for `sub_stage_change` use `messages.sub_stage_change` with `{ to }` or `messages.sub_stage_cleared` when `to` is null; for `closed` interpolate `messages.outcomes[outcome]`; the rest are direct `messages[type]`. Treat `metadata` as the discriminated shapes from `logActivity` (cast narrowly per branch).

- [ ] **Step 2: Build the timeline + mount**

Create `ActivityTimeline.tsx` (`'use client'`): a vertical list (newest first) of `{ activityLabel(entry, messages) }` with a localized `formatDate(entry.occurredAt, locale)` per row, using Typography primitives. Render it in the right column of `ApplicationDetailView` under `messages.timelineTitle`.

- [ ] **Step 3: Verify + commit**

Run `pnpm cleanup`, then `pnpm dev`: confirm the timeline reads correctly for created / stage_change / sub_stage_change / response_received / closed entries.

```bash
git add src/features/application
git commit -m "feat(fe): application activity timeline"
```

### Task 4.8: Card opens the detail; thread the hunt id

**Files:**
- Modify: `src/features/application/views/TrackerBoardView.tsx`
- Modify: `src/features/application/components/BoardColumn.tsx`
- Modify: `src/features/application/components/ApplicationCard.tsx`
- Modify: `src/app/(app)/tracker-board/page.tsx`

**Interfaces:**
- Consumes: the selected hunt id (already resolved in `page.tsx`).
- Produces: each card is a `next/link` to `/tracker-board/{id}?job_hunt={jobHuntId}` (soft-nav => modal); the favorite button stops the navigation.

- [ ] **Step 1: Thread `jobHuntId` to the card**

In `tracker-board/page.tsx`, pass `jobHuntId={selectedJobHunt.id}` into `TrackerBoardView`; thread it through `BoardColumn` to `ApplicationCard`.

- [ ] **Step 2: Wrap the card in a Link**

In `ApplicationCard.tsx`, wrap the `Card` body in `<Link href={\`/tracker-board/${application.id}?job_hunt=${jobHuntId}\`}>` (or make the `Card` the link via `render`/`asChild` if supported). In the favorite button's `onClick`, add `event.preventDefault()` alongside the existing `stopPropagation()` so toggling favorite never navigates.

- [ ] **Step 3: Verify + commit**

Run `pnpm cleanup`, then `pnpm dev`: clicking a card opens the **modal** over the board (URL updates); refreshing that URL shows the **full page**; the close control returns to the board; toggling the star does not open the detail.

```bash
git add src/features/application src/app/\(app\)/tracker-board/page.tsx
git commit -m "feat(fe): open application detail from board cards"
```

### Phase 4 verification

- [ ] Run `pnpm cleanup`, `pnpm test`, and `mcp__fallow__audit`; fix or note findings. Manually exercise modal vs full-page, deep-link, read-only ended-hunt, and every editing control.

---

## Phase 5 - FE: Board interactions (quick-add, filter bar, drag-and-drop)

Adds the board's interactive layer: per-column quick-add (with the Closed-column outcome), the four-dimension `nuqs` filter bar backed by server-side filtering, and `@dnd-kit/react` drag-and-drop between columns (with the shared Close-outcome prompt). All board interactions are disabled for an ended (read-only) hunt.

> **Read first:** `nuqs` v2 server/client split - `createLoader` + parsers from `nuqs/server` for the page, `useQueryStates` from `nuqs` for the bar; `@dnd-kit/react` `DragDropProvider` + `useDraggable` + `useDroppable` (drag-end exposes `event.operation.source`/`event.operation.target` with `.id`, and `event.canceled`).

### Task 5.1: Board filter parsers + server-side filtering

**Files:**
- Modify: `src/features/application/types.ts`
- Create: `src/features/application/utils/boardFilters.ts`
- Modify: `src/features/application/db/queries.ts`
- Modify: `src/app/(app)/tracker-board/page.tsx`
- Modify: `src/features/application/__tests__/queries.test.ts`

**Interfaces:**
- Produces: `APPLICATION_SOURCES`, `WORKING_MODELS` literal arrays (client-safe) on `types.ts`; `boardFilterParsers` (a `nuqs` parser map) + `loadBoardFilters` (server loader) on `boardFilters.ts`.
- Produces: `getBoardApplications(executor, jobHuntId, filters?: BoardFilters)` where `BoardFilters = { tagIds?: string[]; subStageId?: string | null; source?: ApplicationSource | null; workingModel?: WorkingModel | null }`. Tag filter matches apps having **any** selected tag; the others are equality.

- [ ] **Step 1: Add client-safe enum value arrays**

Append to `src/features/application/types.ts`:

```typescript
/** Source enum values as a client-safe literal array (for filters + selects). */
export const APPLICATION_SOURCES = [
  'linkedin',
  'itviec',
  'referral',
  'direct',
  'recruiter',
  'other',
] as const satisfies readonly ApplicationSource[];

/** Working-model enum values as a client-safe literal array. */
export const WORKING_MODELS = [
  'remote',
  'hybrid',
  'onsite',
] as const satisfies readonly WorkingModel[];
```

- [ ] **Step 2: Define the shared filter parsers**

Create `src/features/application/utils/boardFilters.ts` (no `server-only` - imported by both the client bar and the server loader):

```typescript
import { createLoader, parseAsArrayOf, parseAsString, parseAsStringLiteral } from 'nuqs/server';

import { APPLICATION_SOURCES, WORKING_MODELS } from '@/src/features/application/types';

/** URL <=> board-filter state. Shared by the filter bar (client) and the board page (server). */
export const boardFilterParsers = {
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  subStage: parseAsString,
  source: parseAsStringLiteral(APPLICATION_SOURCES),
  workingModel: parseAsStringLiteral(WORKING_MODELS),
};

/** Parses the board filters out of a Next.js `searchParams` object (server-side). */
export const loadBoardFilters = createLoader(boardFilterParsers);
```

- [ ] **Step 3: Write the failing filter query test**

Append to `src/features/application/__tests__/queries.test.ts` (a `getBoardApplications` filter case):

```typescript
import { applicationTags, tags } from '@/src/db/schema';
import { getBoardApplications } from '@/src/features/application/db/queries';

describe('getBoardApplications filters', () => {
  it('returns only apps carrying a selected tag', async () => {
    const user = await createUser();
    const hunt = await createJobHunt(user.id);
    const [tagged, plain] = await db
      .insert(applications)
      .values([
        { jobHuntId: hunt.id, company: 'Tagged', role: 'Eng' },
        { jobHuntId: hunt.id, company: 'Plain', role: 'Eng' },
      ])
      .returning();
    const [remote] = await db.insert(tags).values({ userId: user.id, name: 'remote' }).returning();
    await db.insert(applicationTags).values({ applicationId: tagged.id, tagId: remote.id });

    const result = await getBoardApplications(db, hunt.id, { tagIds: [remote.id] });

    expect(result.map((a) => a.company)).toEqual(['Tagged']);
    expect(result.map((a) => a.company)).not.toContain('Plain');
  });
});
```

(`createUser`/`createJobHunt` and the `applications` import already exist in this test file from the favorite work; add the `tags`/`applicationTags` imports.)

- [ ] **Step 4: Run to verify it fails**

Run: `pnpm test src/features/application/__tests__/queries.test.ts -t filters`
Expected: FAIL (filters arg unused / wrong arity).

- [ ] **Step 5: Add filters to `getBoardApplications`**

In `src/features/application/db/queries.ts`, extend the function (add `and`, `inArray` to the drizzle import and `applicationTags` to the schema import):

```typescript
export type BoardFilters = {
  tagIds?: string[];
  subStageId?: string | null;
  source?: ApplicationSource | null;
  workingModel?: WorkingModel | null;
};

export async function getBoardApplications(
  executor: DbExecutor,
  jobHuntId: string,
  filters: BoardFilters = {},
): Promise<BoardApplication[]> {
  const conditions = [eq(applications.jobHuntId, jobHuntId)];

  if (filters.source) {
    conditions.push(eq(applications.source, filters.source));
  }
  if (filters.workingModel) {
    conditions.push(eq(applications.workingModel, filters.workingModel));
  }
  if (filters.subStageId) {
    conditions.push(eq(applications.subStageId, filters.subStageId));
  }
  if (filters.tagIds && filters.tagIds.length > 0) {
    conditions.push(
      inArray(
        applications.id,
        executor
          .select({ id: applicationTags.applicationId })
          .from(applicationTags)
          .where(inArray(applicationTags.tagId, filters.tagIds)),
      ),
    );
  }

  const rows = await executor.query.applications.findMany({
    where: and(...conditions),
    orderBy: desc(applications.appliedAt),
    columns: {
      id: true,
      company: true,
      role: true,
      stage: true,
      source: true,
      favorite: true,
      appliedAt: true,
    },
    with: {
      subStage: { columns: { id: true, name: true } },
      applicationTags: {
        columns: {},
        with: { tag: { columns: { id: true, name: true, color: true } } },
      },
    },
  });

  return rows.map((row) => ({
    id: row.id,
    company: row.company,
    role: row.role,
    stage: row.stage,
    subStage: row.subStage ? { id: row.subStage.id, name: row.subStage.name } : null,
    tags: row.applicationTags.map(({ tag }) => ({ id: tag.id, name: tag.name, color: tag.color })),
    source: row.source,
    favorite: row.favorite,
    appliedAt: row.appliedAt,
  }));
}
```

- [ ] **Step 6: Parse filters in the board page**

In `tracker-board/page.tsx`, parse the filters and fetch the filter-option lists (the redirect block and `getSelectedJobHunt` stay):

```typescript
import { loadBoardFilters } from '@/src/features/application/utils/boardFilters';
import { listSubStages, listTags } from '@/src/features/application/db/queries';
// ...
  const filters = await loadBoardFilters(searchParams);
  const [applications, subStages, tags] = selectedJobHunt
    ? await Promise.all([
        getBoardApplications(db, selectedJobHunt.id, filters),
        listSubStages(db, user.id),
        listTags(db, user.id),
      ])
    : [[], [], []];

  return (
    <TrackerBoardView
      messages={messages.trackerBoard}
      applications={applications}
      jobHuntId={selectedJobHunt?.id ?? null}
      readOnly={selectedJobHunt?.status === 'ended'}
      subStages={subStages}
      tags={tags}
    />
  );
```

(`searchParams` already typed as a promise; widen it to `Promise<Record<string, string | string[] | undefined>>` so `loadBoardFilters` accepts it, keeping the `job_hunt` access.)

- [ ] **Step 7: Run to verify it passes**

Run: `pnpm test src/features/application/__tests__/queries.test.ts`
Expected: PASS. Then `pnpm cleanup`.

- [ ] **Step 8: Commit**

```bash
git add src/features/application src/app/\(app\)/tracker-board/page.tsx
git commit -m "feat(be): server-side board filtering via shared nuqs parsers"
```

### Task 5.2: Filter bar UI

**Files:**
- Create: `src/features/application/components/BoardFilterBar.tsx`
- Modify: `src/features/application/views/TrackerBoardView.tsx`
- Modify: `src/lib/next-intl/messages/{en-US,vi-VN}/client.json` (add `trackerBoard.filters`)

**Interfaces:**
- Consumes: `useQueryStates(boardFilterParsers)` (from `nuqs`); the user's `tags`/`subStages`; the source/working-model enum labels; `ClientMessages['trackerBoard']`.
- Produces: `BoardFilterBar({ subStages, tags, messages })` that reads/writes the four filters in the URL; updating the URL re-renders the server board with the narrowed query.

- [ ] **Step 1: Add filter i18n keys**

Add to `trackerBoard` (en-US + vi-VN): `"filters": { "tags": "Tags", "subStage": "Sub-stage", "source": "Source", "workingModel": "Working model", "clear": "Clear filters", "all": "All" }`. Run `pnpm i18n:generate`.

- [ ] **Step 2: Build the bar**

Create `BoardFilterBar.tsx` (`'use client'`): `const [filters, setFilters] = useQueryStates(boardFilterParsers)`. Render four controls - a multi-select tag `Combobox` (`filters.tags` <=> `setFilters({ tags })`), a single-select sub-stage `Combobox` over all `subStages` (value `filters.subStage`), a single-select source `Combobox` (labels from `messages.sources`), and a working-model `Combobox` (labels from `messages.workingModels` - reuse the detail's labels or add to `trackerBoard`). A "Clear filters" button resets all to defaults. Each change writes the URL; the server board re-renders filtered.

- [ ] **Step 3: Mount above the columns + verify**

Render `BoardFilterBar` at the top of `TrackerBoardView`, passing the new `subStages`/`tags` props. Run `pnpm cleanup`, then `pnpm dev`: apply each filter, confirm the URL query updates and the columns narrow; reload to confirm the filtered view persists; "Clear filters" empties the URL.

- [ ] **Step 4: Commit**

```bash
git add src/features/application src/lib/next-intl/messages
git commit -m "feat(fe): board filter bar backed by nuqs URL state"
```

### Task 5.3: Quick-add dialog (per-column, Closed outcome)

**Files:**
- Create: `src/features/application/views/QuickAddDialog.tsx`
- Create: `src/features/application/view-models/useCreateApplicationVM.ts`
- Modify: `src/features/application/components/BoardColumn.tsx`
- Modify: `src/lib/next-intl/messages/{en-US,vi-VN}/client.json` (add `trackerBoard.quickAdd`)

**Interfaces:**
- Consumes: `createApplicationAction`; the `closedOutcome` enum labels; `useForm`.
- Produces: `QuickAddDialog({ open, onOpenChange, stage, messages })` (company + role, plus a required outcome select when `stage === 'closed'`); `useCreateApplicationVM(stage, messages, onSuccess)`.

- [ ] **Step 1: Add quick-add i18n keys**

Add to `trackerBoard` (both locales): `"quickAdd": { "title": "Add application", "companyLabel": "Company", "roleLabel": "Role", "outcomeLabel": "Outcome", "outcomes": { "rejected": "Rejected", "withdrawn": "Withdrawn", "accepted": "Accepted", "ghosted": "Ghosted" }, "submit": "Add", "cancel": "Cancel", "errors": { "errorNoActiveJobHunt": "Start a hunt before adding applications." } }`. Run `pnpm i18n:generate`.

- [ ] **Step 2: Build the VM**

Create `useCreateApplicationVM.ts` modeled on `useStartJobHuntVM`: `useForm` over `{ company, role, closedOutcome? }`; `onSubmit` calls `createApplicationAction({ company, role, stage, closedOutcome })`; resolve errors (`errorNoActiveJobHunt`, `errorValidation`) + toast; on success `router.refresh()` + `onSuccess()`.

- [ ] **Step 3: Build the dialog**

Create `QuickAddDialog.tsx` (mirror `StartJobHuntDialog`): a `Dialog` + `DialogContent` hosting the form with `FormTextField`s for company/role and, when `stage === 'closed'`, a required outcome `Combobox`/select (labels from `messages.quickAdd.outcomes`). Title from `messages.quickAdd.title`.

- [ ] **Step 4: Wire the column `+` button**

In `BoardColumn.tsx`, give the `+` button an `onClick` that opens `QuickAddDialog` with this column's `stage` (local `useState` for open). Hidden when `readOnly` (thread a `readOnly` prop from the view). The Closed column's dialog shows the outcome field.

- [ ] **Step 5: Verify + commit**

Run `pnpm cleanup`, then `pnpm dev`: add an application from each column; confirm it lands in the right stage; the Closed column requires an outcome and the new card shows in Closed; with no active hunt selected the `errorNoActiveJobHunt` toast shows.

```bash
git add src/features/application src/lib/next-intl/messages
git commit -m "feat(fe): per-column quick-add with closed-outcome"
```

### Task 5.4: Close-outcome prompt (shared)

**Files:**
- Create: `src/features/application/views/CloseOutcomePrompt.tsx`
- Create: `src/features/application/view-models/useCloseApplicationVM.ts`

**Interfaces:**
- Consumes: `closeApplicationAction`; the `closedOutcome` enum labels.
- Produces: `CloseOutcomePrompt({ open, onOpenChange, applicationId, messages, onClosed })` (an outcome picker => `closeApplicationAction`); `useCloseApplicationVM(messages)` exposing `close(applicationId, outcome)`.

- [ ] **Step 1: Build the VM + prompt**

Create `useCloseApplicationVM.ts`: a `close(applicationId, outcome)` calling `closeApplicationAction({ id: applicationId, outcome })` in `useTransition`, toasting the resolved error or `router.refresh()` + `onClosed()` on success.

Create `CloseOutcomePrompt.tsx`: a `Dialog` listing the four outcomes (`messages.quickAdd.outcomes`) as buttons/radio; selecting one calls `close(applicationId, outcome)`. Reused by the dnd-into-Closed flow (Task 5.5) and available to the detail's close action. Cancel leaves the application unchanged.

- [ ] **Step 2: Verify + commit**

Run `pnpm cleanup`. (Exercised end-to-end in Task 5.5.)

```bash
git add src/features/application
git commit -m "feat(fe): shared close-outcome prompt"
```

### Task 5.5: Drag-and-drop between columns

**Files:**
- Modify: `src/features/application/views/TrackerBoardView.tsx`
- Modify: `src/features/application/components/BoardColumn.tsx`
- Modify: `src/features/application/components/ApplicationCard.tsx`
- Create: `src/features/application/view-models/useBoardDndVM.ts`

**Interfaces:**
- Consumes: `moveStageAction`, the `CloseOutcomePrompt` (Task 5.4); `DragDropProvider`/`useDraggable`/`useDroppable` from `@dnd-kit/react`.
- Produces: optimistic card moves between columns; dropping into Closed opens the prompt; ended hunts are non-draggable.

- [ ] **Step 1: Build the board dnd VM**

Create `useBoardDndVM.ts`: holds the optimistic application list in `useState` (seeded from props, re-seeded on change). Exposes `applications`, an `onDragEnd(event)`, and the pending-close state. In `onDragEnd`: read `source = event.operation.source`, `target = event.operation.target`; bail on `event.canceled` or missing source/target; `appId = String(source.id)`, `toStage = String(target.id)`; if the app is already in `toStage`, bail. If `toStage === 'closed'`, set `pendingClose = { applicationId: appId }` and open the `CloseOutcomePrompt` (do not move yet). Otherwise optimistically move the card to `toStage` (clear its sub-stage chip locally) and call `moveStageAction({ id: appId, to: toStage })`, reverting + toasting on error and `router.refresh()` on success.

- [ ] **Step 2: Wire the provider, draggable cards, droppable columns**

In `TrackerBoardView.tsx`: when `!readOnly`, wrap the columns in `<DragDropProvider onDragEnd={vm.onDragEnd}>` and render `vm.applications`; render the `CloseOutcomePrompt` controlled by the VM's pending-close state (on confirm it closes the app; on cancel it clears pending). In `ApplicationCard.tsx`, call `const { ref, isDragging } = useDraggable({ id: application.id, data: { stage: application.stage } })` and spread `ref` on the card root, with an `isDragging` style; keep the `Link` for click-to-open (dnd activates on pointer-move, click still navigates). In `BoardColumn.tsx`, call `const { ref } = useDroppable({ id: stage })` and spread it on the column root. Skip all dnd wiring when `readOnly`.

- [ ] **Step 3: Verify + commit**

Run `pnpm cleanup`, then `pnpm dev`: drag a card Applied=>Active (card moves, sub-stage chip clears, a `stage_change` + first `response_received` appear in its timeline); drag into Closed (the prompt appears, picking an outcome closes the app with `closed_at`/outcome); confirm an ended hunt's board has no drag and no `+`.

```bash
git add src/features/application
git commit -m "feat(fe): drag-and-drop cards between board columns"
```

### Phase 5 verification

- [ ] Run `pnpm cleanup`, `pnpm test`, and `mcp__fallow__audit`; fix or note findings. Manually exercise quick-add, all four filters, and drag-and-drop incl. the Close-outcome prompt and read-only ended hunts.

---

## Phase 6 - Docs reconciliation

Records the architectural decision and reconciles the canonical docs with the design (per the project's "update docs with code" rule). Do not introduce em dashes or `=>`-style arrows in new prose; leave existing doc content as-is.

### Task 6.1: ADR-0008 - detail modal + full-page pattern

**Files:**
- Create: `docs/adr/0008-application-detail-modal-with-fullpage-fallback.md`

- [ ] **Step 1: Write the ADR**

Create `docs/adr/0008-application-detail-modal-with-fullpage-fallback.md`:

```markdown
# Application detail is an intercepting-route modal with a full-page fallback

The application detail surface is the primary editing surface for one application. It must be
reachable from a board card without losing the board context, deep-linkable/bookmarkable, and
survive a refresh. A plain client-state drawer satisfies none of the URL requirements; a plain
route loses the board underneath.

## Decision

The detail is a Next.js parallel + intercepting route under `tracker-board/`:

- A `@modal` parallel slot hosts an intercepted route `(.)[applicationId]`. On client-side
  (soft) navigation from a board card, the detail renders in a Dialog **modal** over the board;
  the URL becomes `/tracker-board/[applicationId]` so it is bookmarkable.
- The real segment `tracker-board/[applicationId]/page.tsx` renders the same detail as a
  **full page** inside the app shell on a hard load or refresh, with a close control back to the
  board. `@modal/default.tsx` returns null so the slot is empty when no detail is active.
- Both segments are Server Components that fetch the detail (ownership-checked), the activity
  timeline, and the user's sub-stages/tags, then pass typed props to the client editing view.
  A Suspense boundary streams a skeleton while the fetch resolves (no spinner, no client-side
  read round-trip), consistent with the codebase's RSC-fetch-then-props convention.
- An ended hunt's detail is read-only (its board is already a frozen snapshot).

## Consequences

- The detail is shareable, refresh-safe, and closes on back-navigation for free.
- Adds a routing pattern (parallel + intercepting routes) not previously used in the codebase;
  the modal host and the full-page host share one `ApplicationDetail` server component and one
  client view, so there is a single editing implementation.
- The board page gains a `[applicationId]` child segment and a `@modal` slot; the board itself
  is unaffected on hard loads (the slot resolves to `default.tsx`).
```

- [ ] **Step 2: Commit**

```bash
git add docs/adr/0008-application-detail-modal-with-fullpage-fallback.md
git commit -m "docs: ADR-0008 application detail modal with full-page fallback"
```

### Task 6.2: Update screens.md

**Files:**
- Modify: `docs/screens.md`

- [ ] **Step 1: Rename and re-describe the detail surface**

In `docs/screens.md`, rename the "Application Detail Drawer" section to "Application Detail (modal + full page)" and replace its opening description so it states: opened from a board card as a Dialog modal over the board (intercepting route, bookmarkable URL), and rendered as a full page on refresh/deep-link inside the app shell with a close control (ADR-0008). Keep the metadata/sub-stage/tag/notes/timeline bullet list; keep the note that resume + event slots are wired with features 3 & 4. Update any other "drawer" references for this surface to "detail".

- [ ] **Step 2: Confirm the filter-bar line**

Confirm the Tracker Board "Filter bar" bullet already reads "filter by Tag, Sub-stage, source, working model - state lives in the URL query string (nuqs)". It does; no change needed (the todo was the out-of-date one).

- [ ] **Step 3: Commit**

```bash
git add docs/screens.md
git commit -m "docs: screens.md - application detail modal+page, retire drawer wording"
```

### Task 6.3: Reconcile todos.md

**Files:**
- Modify: `docs/todos.md`

- [ ] **Step 1: Rewrite the diverged/renamed items and check off completed work**

In the "2. Applications & board" section:
- Rewrite L97 to: `[FE] Tag/sub-stage/source/working-model filter bar backed by nuqs URL state => screens.md: Tracker Board (Filter bar)`.
- Replace "drawer" with "detail (modal + full page)" in the L88 / L95 / L96 items, referencing ADR-0008.
- Update the L99 note to record that sub-stage reorder shipped in the Settings work (Phase 3), not the board.
- As each plan phase lands, tick the matching boxes (the sub-stage/tag CRUD, the six server actions, the detail wiring, the filter bar, and dnd).

- [ ] **Step 2: Commit**

```bash
git add docs/todos.md
git commit -m "docs: reconcile todos.md with the phase 2 completion design"
```

### Phase 6 verification

- [ ] `pnpm cleanup` (markdown is not linted, but confirm nothing else regressed). The feature is complete when Phases 1-6 are done and `pnpm cleanup` + `pnpm test` + `mcp__fallow__audit` all pass.

---

## Final acceptance

- [ ] All six server actions exist with passing mutation + action tests (Phase 1).
- [ ] Sub-stage + tag CRUD (with reorder) exist with passing tests (Phase 2).
- [ ] Settings screens for sub-stages (with drag-reorder) and tags work (Phase 3).
- [ ] Application detail works as a modal (soft-nav) and full page (refresh/deep-link), with metadata, sub-stage, tags, Lexical notes, and the activity timeline; read-only for ended hunts (Phase 4).
- [ ] Board quick-add (per column, Closed outcome), the four-dimension nuqs filter bar, and drag-and-drop (with the Close-outcome prompt) work; ended hunts are read-only (Phase 5).
- [ ] ADR-0008 added; screens.md + todos.md reconciled (Phase 6).
- [ ] `pnpm cleanup`, `pnpm test`, and `mcp__fallow__audit` all pass.
