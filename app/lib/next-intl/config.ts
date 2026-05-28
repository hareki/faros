export const locales = ['en-US', 'vi-VN'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en-US';
