import { getTranslations } from 'next-intl/server';

import NewPasswordFormView from '@/app/features/auth/views/NewPasswordFormView';
import ResetPasswordFormView from '@/app/features/auth/views/ResetPasswordFormView';
import { getClientMessages } from '@/app/lib/next-intl/getClientMessages';

type ResetPasswordProps = {
  searchParams: Promise<{ token?: string }>;
};

export default async function ResetPassword({ searchParams }: ResetPasswordProps) {
  const { token } = await searchParams;
  const clientMessages = await getClientMessages();

  if (token) {
    const t = await getTranslations('auth.newPassword');
    const messages = { ...clientMessages.auth.shared, ...clientMessages.auth.newPassword };

    return (
      <NewPasswordFormView
        messages={messages}
        token={token}
        title={t('title')}
        subtitle={t('subtitle')}
      />
    );
  }

  const t = await getTranslations('auth.resetPassword');
  const messages = { ...clientMessages.auth.shared, ...clientMessages.auth.resetPassword };

  return <ResetPasswordFormView messages={messages} title={t('title')} subtitle={t('subtitle')} />;
}
