import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { db } from '@/src/db/client';
import { listTags } from '@/src/features/application/db/queries';
import { TagsView } from '@/src/features/application/views/TagsView';
import { requireUser } from '@/src/lib/better-auth/session';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('settingsTags') };
}

export default async function Tags() {
  const user = await requireUser();
  const [tags, messages] = await Promise.all([listTags(db, user.id), getClientMessages()]);

  return <TagsView messages={messages.settings.tags} tags={tags} />;
}
