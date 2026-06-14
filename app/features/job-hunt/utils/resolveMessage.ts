import { type Messages } from 'next-intl';

import {
  resolveErrorMessage as resolveErrorMessagePrimitive,
  type ValidationTranslator,
} from '@/app/lib/next-intl/utils/resolveErrorMessage';
import { type GlobalErrorKey } from '@/app/types/common';

import { type JobHuntErrorKey } from '../actions/types';

export function resolveErrorMessage(
  t: ValidationTranslator,
  messages: Messages['layout']['jobHuntDialogs']['errors'],
  errorKey: JobHuntErrorKey | GlobalErrorKey,
): string {
  return resolveErrorMessagePrimitive(t, messages, errorKey);
}
