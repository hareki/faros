'use client'; // Error boundaries must be Client Components

import { useEffect } from 'react';

import { type ErrorInfo } from 'next/error';
import { useTranslations } from 'next-intl';

import { Button } from '@/app/components/ui/Button';

import { H2, Muted } from './components/ui/Typography';
import { clientLogger } from './lib/logger/client';

export default function RouteError({ error, unstable_retry }: ErrorInfo) {
  const t = useTranslations('GlobalErrorBoundary');

  useEffect(() => {
    clientLogger.error({
      message: 'Page error boundary caught an error',
      source: 'error-boundary',
      context: { scope: 'page' },
      error,
    });
  }, [error]);

  return (
    <div className='flex-center min-h-full flex-1 flex-col gap-4 p-6 text-center'>
      <H2 className='border-b-0 pb-0'>{t('title')}</H2>
      <Muted>{t('subtitle')}</Muted>
      <Button
        onClick={() => {
          unstable_retry();
        }}
      >
        {t('tryAgain')}
      </Button>
    </div>
  );
}
