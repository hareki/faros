import { type useTranslations } from 'next-intl';

import { MIN_PASSWORD_LENGTH } from '../constants';
import { type ValidationMessages } from '../schemas/primitive';

type GlobalValidationTranslator = ReturnType<typeof useTranslations<'GlobalValidation'>>;

export function emailMessages(t: GlobalValidationTranslator, object: string): ValidationMessages {
  return {
    required: t('required', { object }),
    invalid: t('objectInvalid', { object }),
  };
}

export function passwordMessages(
  t: GlobalValidationTranslator,
  object: string,
): ValidationMessages {
  return {
    required: t('required', { object }),
    invalid: t('password', { totalCharCount: MIN_PASSWORD_LENGTH, specialCharCount: 1 }),
  };
}
