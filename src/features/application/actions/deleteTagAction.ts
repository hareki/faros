'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { deleteTag } from '@/src/features/application/db/tagMutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type TagActionResult } from './types';

/** Deletes an owned tag. A missing or foreign id yields `errorTagNotFound`. */
export const deleteTagAction = createServerAction({
  schema: () => z.object({ id: z.uuid() }),
  handler: async ({ id }): Promise<TagActionResult> => {
    const user = await requireUser();
    const deleted = await deleteTag(db, { userId: user.id, id });

    if (!deleted) {
      return { status: 'error', errorKey: 'errorTagNotFound' };
    }

    return { status: 'success' };
  },
});
