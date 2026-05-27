import { Suspense, type PropsWithChildren } from 'react';

// Use this instead of 'next-themes'
// https://github.com/pacocoursey/next-themes/issues/387#issuecomment-4181891723
import { ThemeProvider } from '@teispace/next-themes';
import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { cn } from '@/app/lib/tailwind/utils';

import Toaster from '../components/ui/Sonner';
import { rubik } from '../fonts';
import GlobalClientProvider from '../lib/next-intl/components/GlobalClientProvider';
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
            <GlobalClientProvider>{children}</GlobalClientProvider>
          </Suspense>
          <Toaster position='top-center' toastOptions={{ className: 'font-sans' }} />
        </ThemeProvider>
      </body>
    </html>
  );
}
