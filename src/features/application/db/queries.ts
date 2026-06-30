import 'server-only';

import { asc, desc, eq } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { applications, subStages } from '@/src/features/application/db/schema';
import { type BoardApplication, type BoardStage } from '@/src/features/application/types';

/**
 * Every application on a hunt's board, newest first, shaped for the card (sub-stage + tags
 * joined). The hunt's ownership is settled upstream — a resolved `JobHuntSummary` only ever
 * belongs to the current user — so this takes the id directly.
 */
export async function getBoardApplications(
  executor: DbExecutor,
  jobHuntId: string,
): Promise<BoardApplication[]> {
  const rows = await executor.query.applications.findMany({
    where: eq(applications.jobHuntId, jobHuntId),
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
