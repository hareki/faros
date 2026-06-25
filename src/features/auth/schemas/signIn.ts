import { z } from 'zod';

import { zEmail, type ValidationMessages } from '@/src/lib/zod/schemas/primitive';

type SignInMessages = { email?: ValidationMessages; password?: ValidationMessages };

export function buildSignInSchema(messages?: SignInMessages) {
  return z.object({
    email: zEmail(messages?.email),
    password: z.string().min(1, messages?.password?.required),
  });
}

export type SignInInput = z.infer<ReturnType<typeof buildSignInSchema>>;
