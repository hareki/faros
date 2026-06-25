import { type useTranslations } from 'next-intl';

import { type GlobalErrorKey } from '@/src/types/common';

export type ValidationTranslator = ReturnType<typeof useTranslations<'validation'>>;

export function resolveErrorMessage<TErrorKey extends string>(
  t: ValidationTranslator,
  messages: Record<TErrorKey, string>,
  errorKey: TErrorKey | GlobalErrorKey,
): string {
  if (errorKey === 'errorGeneric' || errorKey === 'errorValidation') {
    return t(errorKey as GlobalErrorKey);
  }

  return messages[errorKey];
}
