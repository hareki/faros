import { getMessages, getTranslations } from 'next-intl/server';

import Link from '@/app/components/ui/Link';
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
          <Link variant='action' href='/sign-up'>
            {chunks}
          </Link>
        ),
      })}
      footer={t.rich('signIn.footer', {
        terms: (chunks) => (
          <Link href='#' size='sm'>
            {chunks}
          </Link>
        ),
        privacy: (chunks) => (
          <Link href='#' size='sm'>
            {chunks}
          </Link>
        ),
      })}
    />
  );
}
