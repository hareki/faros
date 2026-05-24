import { getTranslations } from 'next-intl/server';

import LocaleSwitcher from '@/components/ui/LocaleSwitcher';
import { env } from '@/lib/t3-env';

export default async function HomePage() {
  const t = await getTranslations('HomePage');

  console.log(env.DB_CONNECTION_STRING);
  console.log(env.SHARED_ENV);

  return (
    <div>
      <LocaleSwitcher />
      <h1>{t('title')}</h1>
    </div>
  );
}
