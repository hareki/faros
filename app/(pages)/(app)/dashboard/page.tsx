import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { db } from '@/app/db/client';
import { getSelectedJobHunt } from '@/app/features/job-hunt/server/selectedJobHunt';
import { JOB_HUNT_PARAM } from '@/app/features/job-hunt/utils/selectedJobHunt';
import { requireUser } from '@/app/lib/better-auth/session';

import { Test } from './test';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('dashboard') };
}

type DashboardProps = {
  searchParams: Promise<{ [JOB_HUNT_PARAM]?: string }>;
};

export default async function Dashboard({ searchParams }: DashboardProps) {
  const user = await requireUser();
  const { [JOB_HUNT_PARAM]: jobHuntParam } = await searchParams;
  const selectedJobHunt = await getSelectedJobHunt(db, user.id, jobHuntParam);

  // The Dashboard is the active hunt's home; an ended selection belongs on its Retro. Once a hunt
  // resolves, canonicalize the URL so `?job_hunt` always carries the live selection (this also
  // settles a missing/stale/foreign id). A null selection (no hunts) falls through to the shell's
  // first-run empty state.
  if (selectedJobHunt?.status === 'ended') {
    redirect(`/retro?${JOB_HUNT_PARAM}=${selectedJobHunt.id}`);
  }

  if (selectedJobHunt && jobHuntParam !== selectedJobHunt.id) {
    redirect(`/dashboard?${JOB_HUNT_PARAM}=${selectedJobHunt.id}`);
  }

  return (
    <div>
      <SimpleEmpty />
      <Test />
    </div>
  );
}
