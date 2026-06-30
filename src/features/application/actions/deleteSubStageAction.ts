'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { deleteSubStage } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

/** Deletes an owned sub-stage. A missing or foreign id yields `errorSubStageNotFound`. */
export const deleteSubStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid() }),
  handler: async ({ id }): Promise<SubStageActionResult> => {
    const user = await requireUser();
    const deleted = await deleteSubStage(db, { userId: user.id, id });

    if (!deleted) {
      return { status: 'error', errorKey: 'errorSubStageNotFound' };
    }

    return { status: 'success' };
  },
});
