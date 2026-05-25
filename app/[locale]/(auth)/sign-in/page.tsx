import { getTranslations } from 'next-intl/server';

import { Link } from '@/app/lib/next-intl/navigation';

import SignInForm from './SignInForm';

export default async function SignIn() {
  const t = await getTranslations('Auth');

  return (
    <SignInForm
      title={t('signIn.title')}
      subtitle={t.rich('signIn.subtitle', {
        link: (chunks) => (
          <Link
            href='/sign-up'
            className='font-medium text-foreground underline underline-offset-4'
          >
            {chunks}
          </Link>
        ),
      })}
      footer={t.rich('signIn.footer', {
        terms: (chunks) => (
          <Link href='/terms' className='underline underline-offset-4'>
            {chunks}
          </Link>
        ),
        privacy: (chunks) => (
          <Link href='/privacy' className='underline underline-offset-4'>
            {chunks}
          </Link>
        ),
      })}
    />
  );
}
