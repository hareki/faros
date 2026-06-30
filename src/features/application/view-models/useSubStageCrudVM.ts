'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createSubStageAction } from '@/src/features/application/actions/createSubStageAction';
import { deleteSubStageAction } from '@/src/features/application/actions/deleteSubStageAction';
import { renameSubStageAction } from '@/src/features/application/actions/renameSubStageAction';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { toast } from '@/src/lib/sonner/toast';

type SubStageMessages = ClientMessages['settings']['subStages'];
type Stage = 'active' | 'final_stages';

export function useSubStageCrudVM(messages: SubStageMessages) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (
    action: () => Promise<
      | { status: 'success' }
      | {
          status: 'error';
          errorKey: keyof SubStageMessages['errors'] | 'errorGeneric' | 'errorValidation';
        }
    >,
  ) =>
    new Promise<boolean>((resolve) => {
      startTransition(async () => {
        const result = await action();

        if (result.status === 'error') {
          toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));
          resolve(false);

          return;
        }

        router.refresh();
        resolve(true);
      });
    });

  return {
    isPending,
    create: (stage: Stage, name: string) => run(() => createSubStageAction({ stage, name })),
    rename: (id: string, name: string) => run(() => renameSubStageAction({ id, name })),
    remove: (id: string) => run(() => deleteSubStageAction({ id })),
  };
}
