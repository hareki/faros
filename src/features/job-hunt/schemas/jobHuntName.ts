import { z } from 'zod';

import { type ValidationMessages } from '@/src/lib/zod/schemas/primitive';

type JobHuntNameMessages = { name?: ValidationMessages };

export function buildJobHuntNameSchema(messages?: JobHuntNameMessages) {
  return z.object({
    name: z.string().trim().min(1, messages?.name?.required),
  });
}

export type JobHuntNameInput = z.infer<ReturnType<typeof buildJobHuntNameSchema>>;
