import { getMessages, getTranslations } from 'next-intl/server';

import Link from '@/app/components/ui/Link';
import SignInForm from '@/app/features/auth/views/SignInFormView';

export default async function SignIn() {
  const t = await getTranslations('SignIn');
  const allMessages = await getMessages();
  const messages = { ...allMessages.ClientAuthentication, ...allMessages.ClientSignIn };

  return (
    <SignInForm
      messages={messages}
      title={t('title')}
      subtitle={t.rich('subtitle', {
        link: (chunks) => (
          <Link variant='action' href='/sign-up'>
            {chunks}
          </Link>
        ),
      })}
      footer={t.rich('footer', {
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
