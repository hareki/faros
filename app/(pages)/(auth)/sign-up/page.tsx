import { getMessages, getTranslations } from 'next-intl/server';

import Link from '@/app/components/ui/Link';
import SignUpFormView from '@/app/features/auth/views/SignUpFormView';

export default async function SignUp() {
  const t = await getTranslations('Authentication');
  const messages = (await getMessages()).ClientAuthentication;

  return (
    <SignUpFormView
      messages={messages}
      title={t('signUp.title')}
      subtitle={t.rich('signUp.subtitle', {
        link: (chunks) => (
          <Link variant='action' href='/sign-in'>
            {chunks}
          </Link>
        ),
      })}
      footer={t.rich('signUp.footer', {
        terms: (chunks) => <Link href='#'>{chunks}</Link>,
        acceptableUse: (chunks) => <Link href='#'>{chunks}</Link>,
        privacy: (chunks) => <Link href='#'>{chunks}</Link>,
      })}
    />
  );
}
