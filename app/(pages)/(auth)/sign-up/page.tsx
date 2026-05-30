import { getMessages, getTranslations } from 'next-intl/server';

import Link from '@/app/components/ui/Link';
import SignUpFormView from '@/app/features/auth/views/SignUpFormView';

export default async function SignUp() {
  const t = await getTranslations('SignUp');
  const allMessages = await getMessages();
  const messages = { ...allMessages.ClientAuthentication, ...allMessages.ClientSignUp };

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
