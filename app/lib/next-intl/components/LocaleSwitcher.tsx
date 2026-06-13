'use client';

import { Fragment, useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

import { locales, type Locale } from '@/app/lib/next-intl/config';
import { setUserLocale } from '@/app/lib/next-intl/utils/locale';

export function LocaleSwitcher() {
  const activeLocale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function onSelect(locale: Locale) {
    startTransition(async () => {
      await setUserLocale(locale);
      router.refresh();
    });
  }

  return (
    <Fragment>
      {locales.map((locale) => (
        <button
          key={locale}
          type='button'
          disabled={isPending || locale === activeLocale}
          onClick={() => {
            onSelect(locale);
          }}
        >
          {locale}
        </button>
      ))}
    </Fragment>
  );
}
