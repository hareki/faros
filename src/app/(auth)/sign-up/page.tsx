import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/src/components/ui/Link';
import { SignUpFormView } from '@/src/features/auth/views/SignUpFormView';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('signUp') };
}

export default async function SignUp() {
  const t = await getTranslations('auth.signUp');
  const clientMessages = await getClientMessages();
  const messages = { ...clientMessages.auth.shared, ...clientMessages.auth.signUp };

  return (
    <SignUpFormView
      messages={messages}
      title={t('title')}
      subtitle={t.rich('subtitle', {
        link: (chunks) => (
          <Link variant='action' href='/sign-in'>
            {chunks}
          </Link>
        ),
      })}
      footer={t.rich('footer', {
        terms: (chunks) => <Link href='#'>{chunks}</Link>,
        acceptableUse: (chunks) => <Link href='#'>{chunks}</Link>,
        privacy: (chunks) => <Link href='#'>{chunks}</Link>,
      })}
    />
  );
}
