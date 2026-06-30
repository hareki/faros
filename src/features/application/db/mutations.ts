import 'server-only';

import { and, eq, inArray, ne } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import {
  ensureResponseReceived,
  logActivity,
  recordClose,
  recordStageChange,
} from '@/src/features/activity/db/mutations';
import {
  applicationTags,
  applications,
  subStages,
  tags,
} from '@/src/features/application/db/schema';
import {
  type ApplicationSource,
  type BoardStage,
  type ClosedOutcome,
  type WorkingModel,
} from '@/src/features/application/types';
import { jobHunts } from '@/src/features/job-hunt/db/schema';

// The user's hunts that still accept writes. An ended hunt is frozen history (ADR-0002/ADR-0008),
// so its applications are excluded - that is what makes the editing mutations reject writes to an
// ended hunt at the database level, not just in the UI.
function writableJobHuntIds(executor: DbExecutor, userId: string) {
  return executor
    .select({ id: jobHunts.id })
    .from(jobHunts)
    .where(and(eq(jobHunts.userId, userId), ne(jobHunts.status, 'ended')));
}

// Loads the full application row only when it exists, is owned by `userId`, and its hunt still
// accepts writes. A single `undefined` therefore covers all three "not writable" cases (missing,
// foreign, or ended-hunt), so every editing mutation can keep mapping it to its existing
// not-found result. Returning the full row lets callers read current-state columns from it.
function requireWritableApplication(executor: DbExecutor, userId: string, id: string) {
  return executor
    .select()
    .from(applications)
    .where(
      and(
        eq(applications.id, id),
        inArray(applications.jobHuntId, writableJobHuntIds(executor, userId)),
      ),
    )
    .then((rows) => rows.at(0));
}

type SetFavoriteParams = { userId: string; id: string; favorite: boolean };

/**
 * Sets `favorite` to an explicit target value on an application the user owns. Ownership and
 * writability flow application => job_hunt => user via {@link requireWritableApplication}. Takes
 * the target value rather than blindly flipping, so an optimistic UI stays idempotent and
 * race-safe (last write wins). Does not write to `activity_log` — favorite is organizational, not
 * a milestone (ADR-0007). Returns the updated row, or `undefined` when no writable application
 * matches (wrong id, not the owner, or the owning hunt has ended).
 */
export async function setFavorite(
  executor: DbExecutor,
  { userId, id, favorite }: SetFavoriteParams,
) {
  const app = await requireWritableApplication(executor, userId, id);

  if (!app) {
    return undefined;
  }

  const rows = await executor
    .update(applications)
    .set({ favorite, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .returning();

  return rows.at(0);
}

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
 * milestones, so they log nothing). Returns the updated row, or `undefined` when no writable app
 * matches (wrong id, not the owner, or the owning hunt has ended).
 */
export async function updateApplication(
  executor: DbExecutor,
  { userId, id, data }: UpdateApplicationParams,
) {
  const current = await requireWritableApplication(executor, userId, id);

  if (!current) {
    return undefined;
  }

  const updated = await executor
    .update(applications)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(applications.id, id))
    .returning()
    .then((rows) => rows.at(0));

  if (!hasNoteContent(current.notes) && hasNoteContent(data.notes)) {
    await logActivity(executor, { applicationId: id, type: 'note_added' });
  }

  return updated;
}

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
 * through `recordClose` so the outcome's implications (rejected => response, accepted => offer)
 * hold. Always logs `created`. Caller passes a transaction handle so the row and its activity
 * rows commit together. Returns the new id.
 */
export async function createApplication(
  executor: DbExecutor,
  params: CreateApplicationParams,
): Promise<{ id: string }> {
  if (params.stage === 'closed' && !params.closedOutcome) {
    throw new Error('createApplication: a closed stage requires a closedOutcome');
  }

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
      ...(isClosed ? { closedOutcome: params.closedOutcome ?? null, closedAt: new Date() } : {}),
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

type MoveStageParams = { userId: string; id: string; to: Exclude<BoardStage, 'closed'> };

/**
 * Moves an owned application between non-closed stages (or re-opens it from Closed). If the app
 * is already at the target stage, returns the unchanged row immediately with no database writes
 * (true no-op - sub_stage_id and other columns are left untouched). Otherwise clears
 * `sub_stage_id` (a stage move invalidates the stage-bound sub-stage, ADR-0001) and any closed
 * columns, then stamps `stage_change` via `recordStageChange`, which auto-derives the first
 * `response_received` on `applied => active/final_stages`. Closing is `closeApplication`'s job,
 * never this one. Returns the updated row (or unchanged row on same-stage), or `undefined` when
 * no writable app matches (wrong id, not the owner, or the owning hunt has ended).
 */
export async function moveStage(executor: DbExecutor, { userId, id, to }: MoveStageParams) {
  const current = await requireWritableApplication(executor, userId, id);

  if (!current) {
    return undefined;
  }

  if (current.stage === to) {
    return current;
  }

  const [updated] = await executor
    .update(applications)
    .set({
      stage: to,
      subStageId: null,
      closedOutcome: null,
      closedAt: null,
      updatedAt: new Date(),
    })
    .where(eq(applications.id, id))
    .returning();

  await recordStageChange(executor, { applicationId: id, from: current.stage, to });

  return updated;
}

export type SetSubStageResult =
  | { status: 'ok' }
  | { status: 'application_not_found' }
  | { status: 'sub_stage_invalid' };

type SetSubStageParams = { userId: string; id: string; subStageId: string | null };

/**
 * Sets (or clears, with `null`) an owned application's sub-stage. The target sub-stage must
 * belong to the user and match the app's current stage (the composite FK is the DB backstop,
 * ADR-0001). Logs `sub_stage_change` with sub-stage names - not ids - so the timeline reads
 * correctly after a later rename or delete. Yields `application_not_found` when no writable app
 * matches (wrong id, not the owner, or the owning hunt has ended).
 */
export async function setSubStage(
  executor: DbExecutor,
  { userId, id, subStageId }: SetSubStageParams,
): Promise<SetSubStageResult> {
  const app = await requireWritableApplication(executor, userId, id);

  if (!app) {
    return { status: 'application_not_found' };
  }

  let toName: string | null = null;

  if (subStageId !== null) {
    const target = await executor
      .select({ name: subStages.name, stage: subStages.stage })
      .from(subStages)
      .where(and(eq(subStages.id, subStageId), eq(subStages.userId, userId)))
      .then((rows) => rows.at(0));

    if (target?.stage !== app.stage) {
      return { status: 'sub_stage_invalid' };
    }

    toName = target.name;
  }

  let fromName: string | null = null;

  if (app.subStageId) {
    const previous = await executor
      .select({ name: subStages.name })
      .from(subStages)
      .where(eq(subStages.id, app.subStageId))
      .then((rows) => rows.at(0));

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

type CloseApplicationParams = { userId: string; id: string; outcome: ClosedOutcome };

/**
 * Closes an owned application: sets `stage='closed'` with the outcome + `closedAt`, clears the
 * sub-stage, and records the `closed` activity via `recordClose` (which derives the
 * outcome-implied response/offer). Returns the updated row, or `undefined` when no writable app
 * matches (wrong id, not the owner, or the owning hunt has ended).
 */
export async function closeApplication(
  executor: DbExecutor,
  { userId, id, outcome }: CloseApplicationParams,
) {
  const current = await requireWritableApplication(executor, userId, id);

  if (!current) {
    return undefined;
  }

  const now = new Date();

  const [updated] = await executor
    .update(applications)
    .set({
      stage: 'closed',
      closedOutcome: outcome,
      closedAt: now,
      subStageId: null,
      updatedAt: now,
    })
    .where(eq(applications.id, id))
    .returning();

  await recordClose(executor, { applicationId: id, outcome });

  return updated;
}

export type SetTagsResult =
  | { status: 'ok' }
  | { status: 'application_not_found' }
  | { status: 'tag_invalid' };

type SetTagsParams = { userId: string; id: string; tagIds: string[] };

/**
 * Replaces an owned application's tag set. Every tag id must belong to the user. Tags are
 * filter-only/organizational, so this writes no activity (mirrors `setFavorite`, ADR-0007).
 * Yields `application_not_found` when no writable app matches (wrong id, not the owner, or the
 * owning hunt has ended).
 */
export async function setTags(
  executor: DbExecutor,
  { userId, id, tagIds }: SetTagsParams,
): Promise<SetTagsResult> {
  const app = await requireWritableApplication(executor, userId, id);

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
