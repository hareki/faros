import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { H2 } from '@/app/components/ui/Typography';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('settingsNotification') };
}

export default function Notification() {
  return (
    <div>
      <H2>Notification</H2>
    </div>
  );
}
