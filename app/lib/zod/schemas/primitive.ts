import { z } from 'zod';

import { MIN_PASSWORD_LENGTH, SPECIAL_CHAR_REGEX } from '../constants';

export type ValidationMessages = { required?: string; invalid?: string };

export function zEmail(messages?: ValidationMessages) {
  return z.string().min(1, messages?.required).pipe(z.email(messages?.invalid));
}

export function zPassword(messages?: ValidationMessages) {
  return z
    .string()
    .min(1, messages?.required)
    .min(MIN_PASSWORD_LENGTH, messages?.invalid)
    .regex(SPECIAL_CHAR_REGEX, messages?.invalid);
}
