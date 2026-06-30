import 'server-only';

import { and, eq, inArray } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import {
  ensureResponseReceived,
  logActivity,
  recordClose,
} from '@/src/features/activity/db/mutations';
import { applications } from '@/src/features/application/db/schema';
import {
  type ApplicationSource,
  type BoardStage,
  type ClosedOutcome,
  type WorkingModel,
} from '@/src/features/application/types';
import { jobHunts } from '@/src/features/job-hunt/db/schema';

// All applications whose hunt belongs to the user - the ownership predicate every
// application mutation filters by (subquery form, like the original setFavorite).
function ownedJobHuntIds(executor: DbExecutor, userId: string) {
  return executor.select({ id: jobHunts.id }).from(jobHunts).where(eq(jobHunts.userId, userId));
}

type SetFavoriteParams = { userId: string; id: string; favorite: boolean };

/**
 * Sets `favorite` to an explicit target value on an application the user owns. Ownership flows
 * application => job_hunt => user, so the update is scoped to applications whose `job_hunt_id`
 * belongs to the caller (the subquery is the ownership check). Takes the target value rather than
 * blindly flipping, so an optimistic UI stays idempotent and race-safe (last write wins). Does
 * not write to `activity_log` — favorite is organizational, not a milestone (ADR-0007). Returns
 * the updated row, or `undefined` when no owned application matches (wrong id or not the owner).
 */
export async function setFavorite(
  executor: DbExecutor,
  { userId, id, favorite }: SetFavoriteParams,
) {
  const rows = await executor
    .update(applications)
    .set({ favorite, updatedAt: new Date() })
    .where(
      and(
        eq(applications.id, id),
        inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId)),
      ),
    )
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
 * milestones, so they log nothing). Returns the updated row, or `undefined` when no owned app
 * matches.
 */
export async function updateApplication(
  executor: DbExecutor,
  { userId, id, data }: UpdateApplicationParams,
) {
  const current = await executor
    .select({ notes: applications.notes })
    .from(applications)
    .where(
      and(
        eq(applications.id, id),
        inArray(applications.jobHuntId, ownedJobHuntIds(executor, userId)),
      ),
    )
    .then((rows) => rows.at(0));

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
