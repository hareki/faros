import { getTranslations } from 'next-intl/server';

import { H1 } from '@/app/components/ui/Typography';
import { getUser } from '@/app/lib/better-auth/session';

import Link from './components/ui/Link';
import LocaleSwitcher from './lib/next-intl/components/LocaleSwitcher';

export default async function LandingPage() {
  const t = await getTranslations('LandingPage');
  const user = await getUser();

  return (
    <div>
      <LocaleSwitcher />
      <H1>{t('title')}</H1>
      {user ? (
        <Link href='/dashboard'>{t('toDashboard')}</Link>
      ) : (
        <Link href='/sign-in'>{t('toSignIn')}</Link>
      )}
    </div>
  );
}
