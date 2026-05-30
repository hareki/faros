import { getMessages, getTranslations } from 'next-intl/server';

import NewPasswordFormView from '@/app/features/auth/views/NewPasswordFormView';
import ResetPasswordFormView from '@/app/features/auth/views/ResetPasswordFormView';

type ResetPasswordProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPassword({ searchParams }: ResetPasswordProps) {
  const { token } = await searchParams;
  const allMessages = await getMessages();

  if (token) {
    const t = await getTranslations('NewPassword');
    const messages = { ...allMessages.ClientAuthentication, ...allMessages.ClientNewPassword };

    return (
      <NewPasswordFormView
        messages={messages}
        token={token}
        title={t('title')}
        subtitle={t('subtitle')}
      />
    );
  }

  const t = await getTranslations('ForgotPassword');
  const messages = { ...allMessages.ClientAuthentication, ...allMessages.ClientForgotPassword };

  return (
    <ResetPasswordFormView
      messages={messages}
      title={t('title')}
      subtitle={t('subtitle')}
    />
  );
}
