import { getTranslations } from 'next-intl/server';

import { Link } from '@/app/lib/next-intl/navigation';

import SignUpForm from './SignUpForm';

export default async function SignUp() {
  const t = await getTranslations('Auth');

  return (
    <SignUpForm
      title={t('signUp.title')}
      subtitle={t.rich('signUp.subtitle', {
        link: (chunks) => (
          <Link
            href='/sign-in'
            className='font-medium text-foreground underline underline-offset-4'
          >
            {chunks}
          </Link>
        ),
      })}
      footer={t.rich('signUp.footer', {
        terms: (chunks) => (
          <Link href='/terms' className='underline underline-offset-4'>
            {chunks}
          </Link>
        ),
        acceptableUse: (chunks) => (
          <Link href='/acceptable-use' className='underline underline-offset-4'>
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
