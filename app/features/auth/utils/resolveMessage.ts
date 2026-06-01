import { type Messages } from 'next-intl';

import {
  resolveErrorMessage as resolveErrorMessagePrimitive,
  type GlobalValidationTranslator,
} from '@/app/lib/next-intl/resolveErrorMessage';
import { type GlobalErrorKey } from '@/app/types/common';

import { type AuthErrorKey } from '../actions/types';

export function resolveErrorMessage(
  t: GlobalValidationTranslator,
  messages: Pick<Messages['ClientAuthentication'], AuthErrorKey>,
  errorKey: AuthErrorKey | GlobalErrorKey,
): string {
  return resolveErrorMessagePrimitive(t, messages, errorKey);
}
