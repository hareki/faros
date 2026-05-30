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
// app-side sender. Styled with Tailwind per the react-email docs: pixelBasedPreset
// (no rem), no flex/grid, explicit border-solid, box-border buttons.
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
            <Hr className='mx-0 my-6 w-full border border-solid border-[#eaeaea]' />
            <Text className='text-xs/6 text-[#666666]'>{footer}</Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
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
