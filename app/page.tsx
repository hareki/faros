import { getTranslations } from 'next-intl/server';

import { getUser } from '@/app/lib/better-auth/session';

import { Link } from './components/ui/Link';
import { H2 } from './components/ui/Typography';

export default async function LandingPage() {
  const t = await getTranslations('landingPage');
  const user = await getUser();

  return (
    <div>
      <H2>Landing Page</H2>
      {user ? (
        <Link href='/dashboard'>{t('toDashboard')}</Link>
      ) : (
        <Link href='/sign-in'>{t('toSignIn')}</Link>
      )}
    </div>
  );
}
