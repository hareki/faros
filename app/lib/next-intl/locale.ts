'use server';

import { cookies, headers } from 'next/headers';
import { hasLocale } from 'next-intl';

import { defaultLocale, locales, type Locale } from './config';

const COOKIE_NAME = 'NEXT_LOCALE';

const baseOf = (tag: string) => tag.toLowerCase().split('-')[0];

// Pick the best supported locale from the `Accept-Language` header,
// used only on the first visit before a `NEXT_LOCALE` cookie exists.
function detectFromHeaders(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) {
    return defaultLocale;
  }

  const ranked = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';');
      const q = params.find((p) => p.trim().startsWith('q='));
      const weight = q ? Number.parseFloat(q.split('=')[1]) : 1;

      return { base: baseOf(tag), weight: Number.isNaN(weight) ? 0 : weight };
    })
    .sort((a, b) => b.weight - a.weight);

  for (const { base } of ranked) {
    const match = locales.find((locale) => baseOf(locale) === base);

    if (match) {
      return match;
    }
  }

  return defaultLocale;
}

export async function getUserLocale(): Promise<Locale> {
  const stored = (await cookies()).get(COOKIE_NAME)?.value;

  if (hasLocale(locales, stored)) {
    return stored;
  }

  return detectFromHeaders((await headers()).get('accept-language'));
}

export async function setUserLocale(locale: Locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
