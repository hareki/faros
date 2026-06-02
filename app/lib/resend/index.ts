import { type ReactElement } from 'react';

import { Resend } from 'resend';

import { serverEnv } from '@/app/lib/t3-env/server';

export const resend = new Resend(serverEnv.RESEND_API_KEY);

type SendEmailParams = {
  to: string;
  subject: string;
  /** A React Email component element */
  react: ReactElement;
};

export async function sendEmail({ to, subject, react }: SendEmailParams) {
  const { error } = await resend.emails.send({
    from: serverEnv.RESEND_FROM_EMAIL,
    to,
    subject,
    react,
  });

  if (error) {
    // Surface the failure to the caller (Better Auth callbacks / actions) so it
    // can be logged or retried — Resend swallows errors into the return value.
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
