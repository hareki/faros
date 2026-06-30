'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { setSubStage } from '@/src/features/application/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/**
 * Sets or clears an owned application's sub-stage. Maps the mutation's discriminated result to
 * `errorApplicationNotFound` / `errorSubStageInvalid`.
 */
export const setSubStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), subStageId: z.uuid().nullable() }),
  handler: async ({ id, subStageId }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const result = await db.transaction((tx) =>
      setSubStage(tx, { userId: user.id, id, subStageId }),
    );

    if (result.status === 'application_not_found') {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    if (result.status === 'sub_stage_invalid') {
      return { status: 'error', errorKey: 'errorSubStageInvalid' };
    }

    return { status: 'success' };
  },
});
