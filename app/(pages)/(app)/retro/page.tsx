import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { SimpleEmpty } from '@/app/components/simple/SimpleEmpty';
import { db } from '@/app/db/client';
import { getSelectedJobHunt } from '@/app/features/job-hunt/server/selectedJobHunt';
import { requireUser } from '@/app/lib/better-auth/session';

// Placeholder Retro surface for the selected ended hunt. The real review (funnel, time stats,
// source/resume performance) lands with feature #7.
export default async function RetroPage() {
  const user = await requireUser();
  const selectedJobHunt = await getSelectedJobHunt(db, user.id);

  // Retro is for ended hunts only; an active selection belongs on the Dashboard. A null
  // selection (no hunts) falls through to the shell's first-run empty state.
  if (selectedJobHunt?.status === 'active') {
    redirect('/dashboard');
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
