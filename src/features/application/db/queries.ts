import 'server-only';

import { and, asc, desc, eq, inArray } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { activityLog } from '@/src/features/activity/db/schema';
import {
  applicationTags,
  applications,
  subStages,
  tags,
} from '@/src/features/application/db/schema';
import {
  type ApplicationSource,
  type BoardApplication,
  type BoardStage,
  type ClosedOutcome,
  type WorkingModel,
} from '@/src/features/application/types';
import { jobHunts } from '@/src/features/job-hunt/db/schema';

export type BoardFilters = {
  tagIds?: string[];
  subStageId?: string | null;
  source?: ApplicationSource | null;
  workingModel?: WorkingModel | null;
};

/**
 * Every application on a hunt's board, newest first, shaped for the card (sub-stage + tags
 * joined). The hunt's ownership is settled upstream — a resolved `JobHuntSummary` only ever
 * belongs to the current user — so this takes the id directly.
 */
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

export type TagRow = { id: string; name: string; color: string | null };

/** A user's tags for the settings list, the detail tag picker, and the board filter options. */
export async function listTags(executor: DbExecutor, userId: string): Promise<TagRow[]> {
  return executor
    .select({ id: tags.id, name: tags.name, color: tags.color })
    .from(tags)
    .where(eq(tags.userId, userId))
    .orderBy(asc(tags.name));
}

export type SubStageRow = { id: string; stage: BoardStage; name: string; sortOrder: number };

/** A user's sub-stages for the settings list and the detail picker, ordered by stage then sort. */
export async function listSubStages(executor: DbExecutor, userId: string): Promise<SubStageRow[]> {
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

export type ActivityType = (typeof activityLog.type.enumValues)[number];

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
  const row = (
    await executor
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
      .where(and(eq(applications.id, applicationId), eq(jobHunts.userId, userId)))
  ).at(0);

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
