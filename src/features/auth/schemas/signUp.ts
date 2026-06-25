import { z } from 'zod';

import { zEmail, zPassword, type ValidationMessages } from '@/src/lib/zod/schemas/primitive';

type SignUpMessages = { email?: ValidationMessages; password?: ValidationMessages };

export function buildSignUpSchema(messages?: SignUpMessages) {
  return z.object({
    email: zEmail(messages?.email),
    password: zPassword(messages?.password),
  });
}

export type SignUpInput = z.infer<ReturnType<typeof buildSignUpSchema>>;
