import { type Metadata } from 'next';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { db } from '@/app/db/client';
import { getSelectedJobHunt } from '@/app/features/job-hunt/server/selectedJobHunt';
import { JOB_HUNT_PARAM } from '@/app/features/job-hunt/utils/selectedJobHunt';
import { requireUser } from '@/app/lib/better-auth/session';

type RetroPageProps = {
  searchParams: Promise<{ [JOB_HUNT_PARAM]?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('retro') };
}

// Placeholder Retro surface for the selected ended hunt. The real review (funnel, time stats,
// source/resume performance) lands with feature #7.
export default async function RetroPage({ searchParams }: RetroPageProps) {
  const user = await requireUser();
  const { [JOB_HUNT_PARAM]: jobHuntParam } = await searchParams;
  const selectedJobHunt = await getSelectedJobHunt(db, user.id, jobHuntParam);

  // Retro is for ended hunts only; an active selection belongs on the Dashboard. Once a hunt
  // resolves, canonicalize the URL so `?job_hunt` always carries the live selection (this also
  // settles a missing/stale/foreign id). A null selection (no hunts) falls through to the shell's
  // first-run empty state.
  if (selectedJobHunt?.status === 'active') {
    redirect(`/dashboard?${JOB_HUNT_PARAM}=${selectedJobHunt.id}`);
  }

  if (selectedJobHunt && jobHuntParam !== selectedJobHunt.id) {
    redirect(`/retro?${JOB_HUNT_PARAM}=${selectedJobHunt.id}`);
  }

  const t = await getTranslations('retro');

  return (
    <SimpleEmpty
      className='flex-1'
      title={t('comingSoonTitle')}
      description={t('comingSoonDescription')}
    />
  );
}
