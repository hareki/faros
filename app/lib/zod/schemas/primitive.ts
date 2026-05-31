import { type useTranslations } from 'next-intl';
import { z } from 'zod';

import { MIN_PASSWORD_LENGTH, SPECIAL_CHAR_REGEX } from '../constants';

type GlobalValidationTranslator = ReturnType<typeof useTranslations<'GlobalValidation'>>;

export function zEmail(t: GlobalValidationTranslator, object: string) {
  return z
    .string()
    .min(1, t('required', { object }))
    .pipe(z.email(t('objectInvalid', { object })));
}

export function zPassword(t: GlobalValidationTranslator, object: string) {
  const policyMessage = t('password', {
    totalCharCount: MIN_PASSWORD_LENGTH,
    specialCharCount: 1,
  });

  return z
    .string()
    .min(1, t('required', { object }))
    .min(MIN_PASSWORD_LENGTH, policyMessage)
    .regex(SPECIAL_CHAR_REGEX, policyMessage);
}
