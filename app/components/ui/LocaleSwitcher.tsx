'use client';

import { Fragment } from 'react/jsx-runtime';

import { Link, usePathname } from '@/app/lib/next-intl/navigation';
import { routing } from '@/app/lib/next-intl/routing';

export default function LocaleSwitcher() {
  const pathname = usePathname();

  return (
    <Fragment>
      {routing.locales.map((locale) => (
        <Link key={locale} href={pathname} locale={locale}>
          {locale}
        </Link>
      ))}
    </Fragment>
  );
}
