import { getMessages, getTranslations } from 'next-intl/server';

import NewPasswordFormView from '@/app/features/auth/views/NewPasswordFormView';
import ResetPasswordFormView from '@/app/features/auth/views/ResetPasswordFormView';

type ResetPasswordProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPassword({ searchParams }: ResetPasswordProps) {
  const { token } = await searchParams;
  const t = await getTranslations('Authentication');
  const messages = (await getMessages()).ClientAuthentication;

  if (token) {
    return (
      <NewPasswordFormView
        messages={messages}
        token={token}
        title={t('newPassword.title')}
        subtitle={t('newPassword.subtitle')}
      />
    );
  }

  return (
    <ResetPasswordFormView
      messages={messages}
      title={t('resetPassword.title')}
      subtitle={t('resetPassword.subtitle')}
    />
  );
}
