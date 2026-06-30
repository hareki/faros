'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { renameSubStage } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

/** Renames an owned sub-stage. Missing => `errorSubStageNotFound`; dup => `errorSubStageNameTaken`. */
export const renameSubStageAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), name: z.string().trim().min(1).max(100) }),
  handler: async ({ id, name }): Promise<SubStageActionResult> => {
    const user = await requireUser();

    try {
      const renamed = await renameSubStage(db, { userId: user.id, id, name });

      if (!renamed) {
        return { status: 'error', errorKey: 'errorSubStageNotFound' };
      }
    } catch (error) {
      if (isUniqueViolation(error, 'sub_stages_user_stage_name_unique')) {
        return { status: 'error', errorKey: 'errorSubStageNameTaken' };
      }

      throw error;
    }

    return { status: 'success' };
  },
});
