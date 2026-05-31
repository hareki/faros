import { Section } from 'react-email';

import { Button } from '../src/components/Button';
import { EmailLayout } from '../src/components/EmailLayout';
import { Link } from '../src/components/Link';
import { Heading, Muted, Text } from '../src/components/Typography';

export type VerifyEmailProps = {
  // Inbox preview snippet shown next to the subject line.
  previewText: string;
  heading: string;
  body: string;
  cta: string;
  // Label for the copy-paste fallback line, e.g. "or paste this URL …".
  fallback: string;
  // Fine print below the divider.
  footer: string;
  // Better Auth verification link (token + callbackURL already baked in).
  url: string;
};

// Presentational only — all copy arrives as already-translated props from the
// app-side sender. Styled with the mimicked app design system in ../components.
export default function VerifyEmail({
  previewText,
  heading,
  body,
  cta,
  fallback,
  footer,
  url,
}: VerifyEmailProps) {
  return (
    <EmailLayout previewText={previewText}>
      <Heading level={3} className='mx-0 my-6 p-0 text-center font-normal'>
        {heading}
      </Heading>
      <Text>{body}</Text>
      <Section className='my-6 text-center'>
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
      <Muted className='mt-8 text-xs'>{footer}</Muted>
    </EmailLayout>
  );
}

VerifyEmail.PreviewProps = {
  previewText: 'Verify your email to finish setting up your Faros account',
  heading: 'Verify your email',
  body: 'Thanks for signing up for Faros. Click the button below to verify your email address and activate your account.',
  cta: 'Verify email',
  fallback: 'or copy and paste this URL into your browser:',
  footer: "If you didn't request this email, you can safely ignore it.",
  url: 'https://faros.app/api/auth/verify-email?token=preview-token',
} satisfies VerifyEmailProps;
