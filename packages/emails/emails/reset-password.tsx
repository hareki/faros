import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
  pixelBasedPreset,
} from 'react-email';

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
// app-side sender. Styled with Tailwind per the react-email docs: pixelBasedPreset
// (no rem), no flex/grid, explicit border-solid, box-border buttons.
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
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          presets: [pixelBasedPreset],
        }}
      >
        <Body className='bg-white font-sans'>
          <Container
            className='
              mx-auto my-10 max-w-[465px] rounded-lg border border-solid border-[#eaeaea] p-5
            '
          >
            <Section className='mt-2 text-center'>
              <Text className='text-[20px] font-bold tracking-tight text-black'>Faros</Text>
            </Section>
            <Heading className='mx-0 my-6 p-0 text-center text-2xl font-normal text-black'>
              {heading}
            </Heading>
            <Text className='text-sm/6 text-black'>{body}</Text>
            <Section className='my-8 text-center'>
              <Button
                href={url}
                className='
                  box-border rounded-md bg-[#1e66f5] px-5 py-3 text-center text-sm font-semibold
                  text-white no-underline
                '
              >
                {cta}
              </Button>
            </Section>
            <Text className='text-sm/6 text-black'>
              {fallback}{' '}
              <Link href={url} className='text-[#1e66f5] no-underline'>
                {url}
              </Link>
            </Text>
            <Text className='text-[13px]/6 text-[#666666]'>{expiryNote}</Text>
            <Hr className='mx-0 my-6 w-full border border-solid border-[#eaeaea]' />
            <Text className='text-xs/6 text-[#666666]'>{footer}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
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
