import 'server-only';

import { unstable_rethrow } from 'next/navigation';
import { type z, type ZodType } from 'zod';

import { logger } from '@/src/lib/logger/server';
import { type ActionResult } from '@/src/types/common';

type GenericErrorResponse = Extract<ActionResult<never>, { status: 'error' }>;

/**
 * Validated overload: the action is called with the schema's *input* and the
 * handler receives the parsed *output*.
 */
export function createServerAction<Schema extends ZodType, Result>(config: {
  name?: string;
  schema: () => Schema | Promise<Schema>;
  handler: (data: z.output<Schema>) => Promise<Result>;
}): (input: z.input<Schema>) => Promise<Result | GenericErrorResponse>;

/** Unvalidated overload: the handler receives the input as-is. */
export function createServerAction<Input, Result>(config: {
  name?: string;
  handler: (input: Input) => Promise<Result>;
}): (input: Input) => Promise<Result | GenericErrorResponse>;

// Known business outcomes are returned, never
// thrown, so they are never logged.
export function createServerAction(config: {
  name?: string;
  schema?: () => ZodType | Promise<ZodType>;
  handler: (data: unknown) => Promise<unknown>;
}) {
  const actionName = config.name ?? (config.handler.name || 'anonymousAction');

  return async (input: unknown) => {
    try {
      if (config.schema) {
        const schema = await config.schema();
        const parsed = schema.safeParse(input);

        if (!parsed.success) {
          return { status: 'error', errorKey: 'errorValidation' };
        }

        return await config.handler(parsed.data);
      }

      return await config.handler(input);
    } catch (error) {
      // Never swallow Next's control-flow signals (redirect()/notFound()/etc).
      unstable_rethrow(error);

      logger.error({
        message: `Server action "${actionName}" failed`,
        source: 'server-action',
        context: { actionName },
        error,
      });

      return { status: 'error', errorKey: 'errorGeneric' };
    }
  };
}
