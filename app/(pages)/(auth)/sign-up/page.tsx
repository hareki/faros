import { getTranslations } from 'next-intl/server';

import Link from '@/app/components/ui/Link';
import SignUpFormView from '@/app/features/auth/views/SignUpFormView';
import { getClientMessages } from '@/app/lib/next-intl/getClientMessages';

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
