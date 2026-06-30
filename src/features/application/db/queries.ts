import 'server-only';

import { desc, eq } from 'drizzle-orm';

import { type DbExecutor } from '@/src/db/client';
import { applications } from '@/src/features/application/db/schema';
import { type BoardApplication } from '@/src/features/application/types';

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
