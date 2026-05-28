import Link from 'next/link';
import { getMessages, getTranslations } from 'next-intl/server';

import SignUpFormView from '@/app/features/auth/views/SignUpFormView';

export default async function SignUp() {
  const t = await getTranslations('Auth');
  const messages = (await getMessages()).ClientAuth;

  return (
    <SignUpFormView
      messages={messages}
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
