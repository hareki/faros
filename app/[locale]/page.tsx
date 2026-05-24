import { getTranslations } from 'next-intl/server';

import LocaleSwitcher from '@/app/components/ui/LocaleSwitcher';

import Test from './Testt';

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  return (
    <div>
      <LocaleSwitcher />
      <h1>{t('title')}</h1>
      <Test />
    </div>
  );
}
