import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en-US', 'vi-VN'],
  defaultLocale: 'en-US',
  localePrefix: 'as-needed',
});
