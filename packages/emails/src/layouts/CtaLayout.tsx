import { Body, Container, Html, Img, Preview, Section, Tailwind } from 'react-email';

import { Button } from '../components/Button';
import { Link } from '../components/Link';
import { Heading, Muted, Text } from '../components/Typography';
import { tailwindConfig } from '../theme';

// Gmail can't access preview url via process.env.VERCEL_URL (needs authentication)
const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? '' : '/static';

export type CtaLayoutProps = {
  // Inbox preview snippet shown next to the subject line.
  previewText: string;
  heading: string;
  body: string;
  cta: string;
  // Label for the copy-paste fallback line, e.g. "or paste this URL …".
  fallback: string;
  // Fine print below the divider.
  footer: string;
  // Action link (token + callbackURL already baked in).
  url: string;
};

export function CtaLayout({
  previewText,
  heading,
  body,
  cta,
  fallback,
  footer,
  url,
}: CtaLayoutProps) {
  return (
    <Html>
      <Preview>{previewText}</Preview>
      <Tailwind config={tailwindConfig}>
        <Body className='bg-background font-sans'>
          <Container
            className={`
              mx-auto my-10 max-w-sm rounded-4xl border border-solid border-border bg-card p-6
            `}
          >
            <Section className='mb-6 text-center'>
              <Img
                src={`${baseUrl}/favicon.png`}
                width='48'
                height='48'
                alt="Faros's logo"
                className='mx-auto'
              />
            </Section>
            <Heading level={3} className='mb-2 text-center'>
              {heading}
            </Heading>
            <Text className='text-center'>{body}</Text>
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
            <Muted className='mt-6 text-center text-xs'>{footer}</Muted>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
