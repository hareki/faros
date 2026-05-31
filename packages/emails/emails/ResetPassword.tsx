import { Section } from 'react-email';

import { Button } from '../src/components/Button';
import { EmailLayout } from '../src/components/EmailLayout';
import { Link } from '../src/components/Link';
import { Heading, Muted, Text } from '../src/components/Typography';

export type ResetPasswordEmailProps = {
  // Inbox preview snippet shown next to the subject line.
  previewText: string;
  heading: string;
  body: string;
  cta: string;
  // Label for the copy-paste fallback line, e.g. "or paste this URL …".
  fallback: string;
  // Reminder that the link is single-use and time-limited.
  expiryNote: string;
  // Fine print below the divider.
  footer: string;
  // Better Auth reset link (token + callbackURL already baked in).
  url: string;
};

// Presentational only — all copy arrives as already-translated props from the
// app-side sender. Styled with the mimicked app design system in ../components.
export default function ResetPasswordEmail({
  previewText,
  heading,
  body,
  cta,
  fallback,
  expiryNote,
  footer,
  url,
}: ResetPasswordEmailProps) {
  return (
    <EmailLayout previewText={previewText}>
      <Heading level={3} className='mx-0 my-6 p-0 text-center font-normal'>
        {heading}
      </Heading>
      <Text>{body}</Text>
      <Section className='my-8 text-center'>
        <Button size='lg' href={url}>
          {cta}
        </Button>
      </Section>
      <Text>
        {fallback}{' '}
        <Link href={url} className='no-underline'>
          {url}
        </Link>
      </Text>
      <Muted>{expiryNote}</Muted>
      <Muted className='mt-8 text-xs'>{footer}</Muted>
    </EmailLayout>
  );
}

ResetPasswordEmail.PreviewProps = {
  previewText: 'Reset the password for your Faros account',
  heading: 'Reset your password',
  body: 'We received a request to reset your Faros password. Click the button below to choose a new one.',
  cta: 'Reset password',
  fallback: 'or copy and paste this URL into your browser:',
  expiryNote:
    "This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.",
  footer: "If you didn't request this email, you can safely ignore it.",
  url: 'https://faros.app/reset-password?token=preview-token',
} satisfies ResetPasswordEmailProps;
