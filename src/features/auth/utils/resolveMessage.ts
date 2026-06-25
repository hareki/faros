import { type Messages } from 'next-intl';

import {
  resolveErrorMessage as resolveErrorMessagePrimitive,
  type ValidationTranslator,
} from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { type GlobalErrorKey } from '@/src/types/common';

import { type AuthErrorKey } from '../actions/types';

export function resolveErrorMessage(
  t: ValidationTranslator,
  messages: Messages['auth']['shared']['errors'],
  errorKey: AuthErrorKey | GlobalErrorKey,
): string {
  return resolveErrorMessagePrimitive(t, messages, errorKey);
}
