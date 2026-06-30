'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { closeApplication } from '@/src/features/application/db/mutations';
import { closedOutcome } from '@/src/features/application/db/schema';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Closes an owned application with a required outcome (the Close-outcome prompt collects it). A
 * missing or foreign id yields `errorApplicationNotFound`.
 */
export const closeApplicationAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), outcome: z.enum(closedOutcome.enumValues) }),
  handler: async ({ id, outcome }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const updated = await db.transaction((tx) =>
      closeApplication(tx, { userId: user.id, id, outcome }),
    );

    if (!updated) {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    return { status: 'success' };
  },
});
