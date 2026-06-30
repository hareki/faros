'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { createSubStage } from '@/src/features/application/db/subStageMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { isUniqueViolation } from '@/src/lib/drizzle/errors';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type SubStageActionResult } from './types';

// Sub-stages exist only for the interviewing columns (CONTEXT.md), so the schema rejects the
// other stages outright.
const SUB_STAGE_STAGES = ['active', 'final_stages'] as const;

/** Creates a sub-stage for a stage. A duplicate name yields `errorSubStageNameTaken`. */
export const createSubStageAction = createServerAction({
  schema: () =>
    z.object({
      stage: z.enum(SUB_STAGE_STAGES),
      name: z.string().trim().min(1).max(100),
    }),
  handler: async ({ stage, name }): Promise<SubStageActionResult> => {
    const user = await requireUser();

    try {
      await createSubStage(db, { userId: user.id, stage, name });
    } catch (error) {
      if (isUniqueViolation(error, 'sub_stages_user_stage_name_unique')) {
        return { status: 'error', errorKey: 'errorSubStageNameTaken' };
      }

      throw error;
    }

    return { status: 'success' };
  },
});
