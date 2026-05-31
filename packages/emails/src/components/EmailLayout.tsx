import { type ReactNode } from 'react';

import { Body, Container, Html, Img, Preview, Section, Tailwind, Text } from 'react-email';

import { tailwindConfig } from '../theme';

// Shared shell + Faros brand header for every email. Replaces the boilerplate that was
// duplicated across templates. Centering is done with text-center (no flex/grid).
const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '';

export type EmailLayoutProps = {
  // Inbox preview snippet shown next to the subject line.
  previewText: string;
  children: ReactNode;
};

export function EmailLayout({ previewText, children }: EmailLayoutProps) {
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
            <Section className='text-center'>
              <Img
                src={`${baseUrl}/static/favicon.png`}
                width='32'
                height='32'
                alt="Faros's logo"
                className='mx-auto'
              />
              <Text className='m-0 text-2xl font-bold text-foreground'>Faros</Text>
            </Section>
            {children}
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
