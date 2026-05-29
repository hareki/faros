import { getMessages, getTranslations } from 'next-intl/server';

import ResetPasswordFormView from '@/app/features/auth/views/ResetPasswordFormView';

export default async function ResetPassword() {
  const t = await getTranslations('Auth');
  const messages = (await getMessages()).ClientAuth;

  return (
    <ResetPasswordFormView
      messages={messages}
      title={t('resetPassword.title')}
      subtitle={t('resetPassword.subtitle')}
    />
  );
}
