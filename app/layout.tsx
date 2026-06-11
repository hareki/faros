import { Suspense, type PropsWithChildren } from 'react';

// Use this instead of 'next-themes'
// https://github.com/pacocoursey/next-themes/issues/387#issuecomment-4181891723
import { ThemeProvider } from '@teispace/next-themes';
import { type Metadata } from 'next';
import Script from 'next/script';
import { getLocale, getTranslations } from 'next-intl/server';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { cn } from '@/app/lib/tailwind/utils';

import { rubik } from './fonts';
import GlobalClientProvider from './lib/next-intl/components/GlobalClientProvider';
import Toaster from './lib/sonner/components/Sonner';
import { serverEnv } from './lib/t3-env/server';

import './styles/globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('Metadata');

  return {
    title: 'Faros',
    description: t('description'),
  };
}

type RootLayoutProps = PropsWithChildren;

async function InnerRootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={cn(
        'font-sans',
        'h-full',
        'antialiased',
        /* Enable using font-sans className*/
        rubik.variable,
      )}
      // https://github.com/pacocoursey/next-themes#with-app
      suppressHydrationWarning
    >
      <head>
        {serverEnv.STAGE === 'development' && (
          <Script
            src='//unpkg.com/react-scan/dist/auto.global.js'
            crossOrigin='anonymous'
            strategy='beforeInteractive'
          />
        )}
      </head>
      <body className='flex min-h-full flex-col'>
        <ThemeProvider attribute='data-theme'>
          <Suspense>
            <NuqsAdapter>
              <GlobalClientProvider>{children}</GlobalClientProvider>
            </NuqsAdapter>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <Suspense>
      <InnerRootLayout>{children}</InnerRootLayout>
    </Suspense>
  );
}
