import { type Messages } from 'next-intl';

import {
  resolveErrorMessage as resolveErrorMessagePrimitive,
  type ValidationTranslator,
} from '@/app/lib/next-intl/resolveErrorMessage';
import { type GlobalErrorKey } from '@/app/types/common';

import { type AuthErrorKey } from '../actions/types';

export function resolveErrorMessage(
  t: ValidationTranslator,
  messages: Pick<Messages['auth']['shared'], AuthErrorKey>,
  errorKey: AuthErrorKey | GlobalErrorKey,
): string {
  return resolveErrorMessagePrimitive(t, messages, errorKey);
}
