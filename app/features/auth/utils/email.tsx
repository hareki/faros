import 'server-only';
import { ResetPasswordEmail, VerifyEmail } from '@faros/emails';
import { getTranslations } from 'next-intl/server';

import { getUserLocale } from '@/app/lib/next-intl/locale';
import { sendEmail } from '@/app/lib/resend';

type SendParams = {
  to: string;
  url: string;
};

export async function sendVerificationEmail({ to, url }: SendParams) {
  const locale = await getUserLocale();
  const t = await getTranslations({ locale, namespace: 'Email' });

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
  const t = await getTranslations({ locale, namespace: 'Email' });

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
        expiryNote={t('reset.expiryNote')}
        footer={t('common.footer')}
        url={url}
      />
    ),
  });
}
