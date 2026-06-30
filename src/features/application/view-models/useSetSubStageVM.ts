'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { setSubStageAction } from '@/src/features/application/actions/setSubStageAction';
import { type ApplicationDetail } from '@/src/features/application/db/queries';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { toast } from '@/src/lib/sonner/toast';

type ApplicationDetailMessages = ClientMessages['applicationDetail'];

/**
 * Immediate-commit VM for setting or clearing an application's sub-stage.
 * Returns `{ set, isPending }` where `set` resolves `true` on success (triggers a
 * route refresh) and `false` on error (shows a toast). Callers should revert
 * optimistic local state when `set` returns `false`.
 */
export function useSetSubStageVM(detail: ApplicationDetail, messages: ApplicationDetailMessages) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // ApplicationErrorKey has 4 keys; messages.errors has 3. Widen to Record<string, string>
  // (sound upcast - every key setSubStageAction actually returns is present in messages.errors).
  const errorMessages: Record<string, string> = messages.errors;

  const set = (subStageId: string | null): Promise<boolean> =>
    new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await setSubStageAction({ id: detail.id, subStageId });

        if (result.status === 'error') {
          toast.error(resolveErrorMessage(t, errorMessages, result.errorKey));
          resolve(false);

          return;
        }

        router.refresh();
        resolve(true);
      });
    });

  return { set, isPending };
}
