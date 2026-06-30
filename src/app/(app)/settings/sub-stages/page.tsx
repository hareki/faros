import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { db } from '@/src/db/client';
import { listSubStages } from '@/src/features/application/db/queries';
import { SubStagesView } from '@/src/features/application/views/SubStagesView';
import { requireUser } from '@/src/lib/better-auth/session';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('settingsSubStages') };
}

export default async function SubStages() {
  const user = await requireUser();
  const [subStages, messages] = await Promise.all([
    listSubStages(db, user.id),
    getClientMessages(),
  ]);

  return <SubStagesView messages={messages.settings.subStages} subStages={subStages} />;
}
