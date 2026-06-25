import { getTranslations } from 'next-intl/server';

import { getUserLocale } from '@/src/lib/next-intl/utils/locale';
import { sendEmail } from '@/src/lib/resend';
import { serverEnv } from '@/src/lib/t3-env/server';
import { ExistingAccountEmail, ResetPasswordEmail, VerifyEmail } from '@faros/emails';

type SendParams = {
  to: string;
  url: string;
};

export async function sendVerificationEmail({ to, url }: SendParams) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'email' });

  await sendEmail({
    to,
    subject: t('verify.subject'),
    react: (
      <VerifyEmail
        previewText={t('verify.preview')}
        heading={t('verify.heading')}
        body={t('verify.body')}
        cta={t('verify.cta')}
        fallback={t('common.fallback')}
        footer={t('common.footer')}
        url={url}
      />
    ),
  });
}

export async function sendResetPasswordEmail({ to, url }: SendParams) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'email' });

  await sendEmail({
    to,
    subject: t('reset.subject'),
    react: (
      <ResetPasswordEmail
        previewText={t('reset.preview')}
        heading={t('reset.heading')}
        body={t('reset.body')}
        cta={t('reset.cta')}
        fallback={t('common.fallback')}
        footer={t('common.footer')}
        url={url}
      />
    ),
  });
}

export async function sendExistingAccountEmail({ to }: { to: string }) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'email' });

  await sendEmail({
    to,
    subject: t('existing.subject'),
    react: (
      <ExistingAccountEmail
        previewText={t('existing.preview')}
        heading={t('existing.heading')}
        body={t('existing.body')}
        cta={t('existing.cta')}
        fallback={t('common.fallback')}
        footer={t('common.footer')}
        url={`${serverEnv.BETTER_AUTH_URL}/sign-in`}
      />
    ),
  });
}
