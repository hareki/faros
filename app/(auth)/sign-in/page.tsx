import Link from 'next/link';
import { getMessages, getTranslations } from 'next-intl/server';

import SignInForm from '@/app/features/auth/views/SignInFormView';

export default async function SignIn() {
  const t = await getTranslations('Auth');
  const messages = (await getMessages()).ClientAuth;

  return (
    <SignInForm
      messages={messages}
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
