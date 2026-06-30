'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { closeApplicationAction } from '@/src/features/application/actions/closeApplicationAction';
import { type ClosedOutcome } from '@/src/features/application/types';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { toast } from '@/src/lib/sonner/toast';

/**
 * VM for closing an application with a required outcome. Exposes `close(applicationId, outcome)`
 * which calls `closeApplicationAction`, surfaces errors as toasts, refreshes the route on success,
 * and resolves a boolean indicating whether the close succeeded.
 */
export function useCloseApplicationVM(messages: ClientMessages['trackerBoard']) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // The action's error union is wider than this surface's message map (quickAdd.errors only covers
  // errorNoActiveJobHunt). Using || catches the runtime undefined returned for unknown keys such as
  // errorApplicationNotFound (app concurrently deleted) so the toast never shows undefined.
  const errorMessages: Record<string, string> = messages.quickAdd.errors;

  const close = (applicationId: string, outcome: ClosedOutcome): Promise<boolean> =>
    new Promise((resolve) => {
      startTransition(async () => {
        const result = await closeApplicationAction({ id: applicationId, outcome });

        if (result.status === 'error') {
          const msg = resolveErrorMessage(t, errorMessages, result.errorKey);

          toast.error(msg || t('errorGeneric'));
          resolve(false);

          return;
        }

        router.refresh();
        resolve(true);
      });
    });

  return { close, isPending };
}
