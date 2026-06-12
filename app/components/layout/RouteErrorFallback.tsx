'use client';

import { useEffect } from 'react';

import { type ErrorInfo } from 'next/error';
import { useTranslations } from 'next-intl';

import { Button } from '@/app/components/ui/Button';
import { H2, Muted } from '@/app/components/ui/Typography';
import { clientLogger } from '@/app/lib/logger/client';

type RouteErrorFallbackProps = ErrorInfo & {
  /** Logged under `context.scope` to distinguish which boundary fired. */
  scope: string;
};

export function RouteErrorFallback({ error, unstable_retry, scope }: RouteErrorFallbackProps) {
  const t = useTranslations('errorBoundary');

  useEffect(() => {
    clientLogger.error({
      message: 'Page error boundary caught an error',
      source: 'error-boundary',
      context: { scope },
      error,
    });
  }, [error, scope]);

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
