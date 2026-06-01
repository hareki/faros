import 'server-only';

import { type z, type ZodType } from 'zod';

import { type ActionResult } from '@/app/types/common';

type BadInputResponse = Extract<ActionResult<never>, { status: 'error' }>;

export function createValidationPipe<Schema extends ZodType, Result>(
  buildSchema: () => Schema | Promise<Schema>,
  handler: (data: z.output<Schema>) => Promise<Result>,
): (input: z.input<Schema>) => Promise<Result | BadInputResponse> {
  return async (input) => {
    const schema = await buildSchema();
    const parsed = schema.safeParse(input);

    if (!parsed.success) {
      return { status: 'error', errorKey: 'errorValidation' };
    }

    return handler(parsed.data);
  };
}
