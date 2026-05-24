import { Suspense, type PropsWithChildren } from 'react';

import { type Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import { ThemeProvider } from 'next-themes';

import { cn } from '@/app/lib/tailwind/utils';

import Toaster from '../components/ui/Sonner';
import { rubik } from '../fonts';
import { routing } from '../lib/next-intl/routing';

import '../styles/globals.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Metadata' });

  return {
    title: 'Faros',
    description: t('description'),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

type RootLayoutProps = PropsWithChildren<{ params: Promise<{ locale: string }> }>;
export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

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
      <body className='flex min-h-full flex-col'>
        <ThemeProvider attribute='data-theme'>
          <Suspense>
            <NextIntlClientProvider messages={null}>{children}</NextIntlClientProvider>
            <Toaster position='top-center' toastOptions={{ className: 'font-sans' }} />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
