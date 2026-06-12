import { getTranslations } from 'next-intl/server';

import Link from '@/app/components/ui/Link';
import SignInForm from '@/app/features/auth/views/SignInFormView';
import { getClientMessages } from '@/app/lib/next-intl/utils/getClientMessages';

export default async function SignIn() {
  const t = await getTranslations('auth.signIn');
  const clientMessages = await getClientMessages();
  const messages = { ...clientMessages.auth.shared, ...clientMessages.auth.signIn };

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
