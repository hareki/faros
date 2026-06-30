'use client';

import { useTransition } from 'react';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { createTagAction } from '@/src/features/application/actions/createTagAction';
import { deleteTagAction } from '@/src/features/application/actions/deleteTagAction';
import { updateTagAction } from '@/src/features/application/actions/updateTagAction';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { toast } from '@/src/lib/sonner/toast';

type TagMessages = ClientMessages['settings']['tags'];

export function useTagCrudVM(messages: TagMessages) {
  const t = useTranslations('validation');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const run = (
    action: () => Promise<
      | { status: 'success' }
      | {
          status: 'error';
          errorKey: keyof TagMessages['errors'] | 'errorGeneric' | 'errorValidation';
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
    create: (name: string, color: string) => run(() => createTagAction({ name, color })),
    update: (id: string, name: string, color: string) =>
      run(() => updateTagAction({ id, name, color })),
    remove: (id: string) => run(() => deleteTagAction({ id })),
  };
}
