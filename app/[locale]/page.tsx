import { getTranslations } from 'next-intl/server';

import LocaleSwitcher from '../lib/next-intl/components/LocaleSwitcher';

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  return (
    <div>
      <LocaleSwitcher />
      <h1>{t('title')}</h1>
    </div>
  );
}
