import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { db } from '@/src/db/client';
import {
  getBoardApplications,
  listSubStages,
  listTags,
} from '@/src/features/application/db/queries';
import { loadBoardFilters } from '@/src/features/application/utils/boardFilters';
import { TrackerBoardView } from '@/src/features/application/views/TrackerBoardView';
import { getSelectedJobHunt } from '@/src/features/job-hunt/server/selectedJobHunt';
import { JOB_HUNT_PARAM } from '@/src/features/job-hunt/utils/selectedJobHunt';
import { requireUser } from '@/src/lib/better-auth/session';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('trackerBoard') };
}

type TrackerBoardProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

// Available for both the active hunt and a selected ended hunt. When the selected hunt is
// ended the board renders read-only (a frozen history view) — wired up with the real board.
export default async function TrackerBoard({ searchParams }: TrackerBoardProps) {
  const user = await requireUser();
  const { [JOB_HUNT_PARAM]: jobHuntParam } = await searchParams;
  const selectedJobHunt = await getSelectedJobHunt(db, user.id, jobHuntParam as string | undefined);

  // Keep `?job_hunt` carrying the live selection (also settles a missing/stale/foreign id). A
  // null selection (no hunts) falls through to the shell's first-run empty state.
  if (selectedJobHunt && jobHuntParam !== selectedJobHunt.id) {
    redirect(`/tracker-board?${JOB_HUNT_PARAM}=${selectedJobHunt.id}`);
  }

  const messages = await getClientMessages();
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
}
