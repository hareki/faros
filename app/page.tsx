import { getTranslations } from 'next-intl/server';

import { H1 } from '@/app/components/ui/Typography';

import LocaleSwitcher from './lib/next-intl/components/LocaleSwitcher';

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  return (
    <div>
      <LocaleSwitcher />
      <H1>{t('title')}</H1>
    </div>
  );
}
