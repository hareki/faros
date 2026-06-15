import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { H2 } from '@/app/components/ui/Typography';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('settingsTags') };
}

export default function Tags() {
  return (
    <div>
      <H2>Tags</H2>
    </div>
  );
}
