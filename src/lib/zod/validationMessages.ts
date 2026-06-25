import { type useTranslations } from 'next-intl';

import { MIN_PASSWORD_LENGTH } from './constants';
import { type ValidationMessages } from './schemas/primitive';

type ValidationTranslator = ReturnType<typeof useTranslations<'validation'>>;

export function emailMessages(t: ValidationTranslator, object: string): ValidationMessages {
  return {
    required: t('required', { object }),
    invalid: t('objectInvalid', { object }),
  };
}

export function passwordMessages(t: ValidationTranslator, object: string): ValidationMessages {
  return {
    required: t('required', { object }),
    invalid: t('password', { totalCharCount: MIN_PASSWORD_LENGTH, specialCharCount: 1 }),
  };
}
