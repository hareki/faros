import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { NewPasswordFormView } from '@/src/features/auth/views/NewPasswordFormView';
import { ResetPasswordFormView } from '@/src/features/auth/views/ResetPasswordFormView';
import { getClientMessages } from '@/src/lib/next-intl/utils/getClientMessages';

type ResetPasswordProps = {
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('resetPassword') };
}

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
