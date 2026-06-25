import { type PropsWithChildren } from 'react';

import { getTranslations } from 'next-intl/server';

import { EmptyJobHunt } from '@/src/features/job-hunt/components/EmptyJobHunt';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

import { PageTitle } from './PageTitle';
import { PageTransition } from './PageTransition';
import { type Routes } from '../../ui/Link';

type PageWrapperProps = PropsWithChildren<{
  firstRun: boolean;
}>;

export async function PageWrapper({ children, firstRun }: PageWrapperProps) {
  const clientMessages = await getClientMessages();
  const t = await getTranslations('metadata');

  const titles: Partial<Record<Routes, string>> = {
    '/dashboard': t('dashboard'),
    '/tracker-board': t('trackerBoard'),
    '/resume-library': t('resumeLibrary'),
    '/retro': t('retro'),
    '/settings/notification': t('settingsNotification'),
    '/settings/tags': t('settingsTags'),
    '/settings/sub-stages': t('settingsSubStages'),
  };

  return (
    <main className='scroll-layer p-3'>
      {!firstRun ? (
        <div className='scroll-layer gap-6'>
          <PageTitle titles={titles} />
          <PageTransition>{children}</PageTransition>
        </div>
      ) : (
        <EmptyJobHunt
          messages={clientMessages.layout.jobHuntEmpty}
          dialogMessages={clientMessages.layout.jobHuntDialogs}
        />
      )}
    </main>
  );
}
