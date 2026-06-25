import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/src/components/ui/Link';
import { SignInForm } from '@/src/features/auth/views/SignInFormView';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('signIn') };
}

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
