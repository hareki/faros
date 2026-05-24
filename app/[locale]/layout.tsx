import { type PropsWithChildren } from 'react';

import { type Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getTranslations } from 'next-intl/server';

import { cn } from '@/app/lib/tailwind/utils';

import { rubik } from '../fonts';

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

type RootLayoutProps = PropsWithChildren<{ params: Promise<{ locale: string }> }>;

export default async function RootLayout({ children, params }: RootLayoutProps) {
  const { locale } = await params;

  return (
    <html lang={locale} className={cn('h-full', 'antialiased', rubik.variable, 'font-sans')}>
      <body className='flex min-h-full flex-col'>
        <NextIntlClientProvider messages={null}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
