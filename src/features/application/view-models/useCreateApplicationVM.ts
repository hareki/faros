'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { createApplicationAction } from '@/src/features/application/actions/createApplicationAction';
import { closedOutcome } from '@/src/features/application/db/schema';
import { type BoardStage } from '@/src/features/application/types';
import { useForm } from '@/src/lib/form/hooks/useForm';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { toast } from '@/src/lib/sonner/toast';

type QuickAddMessages = ClientMessages['trackerBoard']['quickAdd'];
type ClosedOutcomeValue = (typeof closedOutcome.enumValues)[number];

type QuickAddFormValues = {
  company: string;
  role: string;
  closedOutcome: ClosedOutcomeValue | null;
};

/**
 * Form view-model for the per-column quick-add dialog: `company` + `role`, with `closedOutcome`
 * required by the Zod refine when `stage === 'closed'`. Calls `createApplicationAction` and
 * surfaces errors as toasts; on success it refreshes the route and invokes `onSuccess`.
 */
export function useCreateApplicationVM(
  stage: BoardStage,
  messages: QuickAddMessages,
  onSuccess: () => void,
) {
  const t = useTranslations('validation');

  const schema = z
    .object({
      company: z
        .string()
        .trim()
        .min(1, t('required', { object: messages.companyLabel }))
        .max(200),
      role: z
        .string()
        .trim()
        .min(1, t('required', { object: messages.roleLabel }))
        .max(200),
      closedOutcome: z.enum(closedOutcome.enumValues).nullable(),
    })
    .refine((data) => stage !== 'closed' || data.closedOutcome !== null, {
      path: ['closedOutcome'],
      message: t('required', { object: messages.outcomeLabel }),
    });

  const [{ control }, Form] = useForm<QuickAddFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: '',
      role: '',
      closedOutcome: null,
    },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // The action's error union (ApplicationErrorKey) is wider than this surface's message map,
  // so widen to a string-keyed record for the shared resolver.
  const errorMessages: Record<string, string> = messages.errors;

  const onSubmit = (values: QuickAddFormValues) => {
    startTransition(async () => {
      const result = await createApplicationAction({
        company: values.company,
        role: values.role,
        stage,
        closedOutcome: values.closedOutcome,
      });

      if (result.status === 'error') {
        toast.error(resolveErrorMessage(t, errorMessages, result.errorKey));

        return;
      }

      router.refresh();
      onSuccess();
    });
  };

  return { control, Form, isPending, onSubmit };
}
