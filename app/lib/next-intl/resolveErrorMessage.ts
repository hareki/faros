import { type useTranslations } from 'next-intl';

import { type GlobalErrorKey } from '@/app/types/common';

export type GlobalValidationTranslator = ReturnType<typeof useTranslations<'GlobalValidation'>>;

export function resolveErrorMessage<TErrorKey extends string>(
  t: GlobalValidationTranslator,
  messages: Record<TErrorKey, string>,
  errorKey: TErrorKey | GlobalErrorKey,
): string {
  if (errorKey === 'errorGeneric' || errorKey === 'errorValidation') {
    return t(errorKey as GlobalErrorKey);
  }

  return messages[errorKey];
}
