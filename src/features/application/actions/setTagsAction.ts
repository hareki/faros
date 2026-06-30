'use server';

import { z } from 'zod';

import { db } from '@/src/db/client';
import { setTags } from '@/src/features/application/db/mutations';
import { requireUser } from '@/src/lib/better-auth/session';
import { createServerAction } from '@/src/lib/next/createServerAction';

import { type ApplicationActionResult } from './types';

/** Replaces an owned application's tags. Maps `tag_invalid => errorTagInvalid`. */
export const setTagsAction = createServerAction({
  schema: () => z.object({ id: z.uuid(), tagIds: z.array(z.uuid()) }),
  handler: async ({ id, tagIds }): Promise<ApplicationActionResult> => {
    const user = await requireUser();

    const result = await db.transaction((tx) => setTags(tx, { userId: user.id, id, tagIds }));

    if (result.status === 'application_not_found') {
      return { status: 'error', errorKey: 'errorApplicationNotFound' };
    }

    if (result.status === 'tag_invalid') {
      return { status: 'error', errorKey: 'errorTagInvalid' };
    }

    return { status: 'success' };
  },
});
