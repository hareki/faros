'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type z } from 'zod';

import { renameJobHuntAction } from '@/app/features/job-hunt/actions/renameJobHuntAction';
import { buildJobHuntNameSchema } from '@/app/features/job-hunt/schemas/jobHuntName';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';
import { resolveErrorMessage } from '@/app/features/job-hunt/utils/resolveMessage';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';
import { toast } from '@/app/lib/sonner/toast';

type RenameJobHuntMessages = ClientMessages['layout']['jobHuntDialogs']['rename'];
type JobHuntErrorMessages = ClientMessages['layout']['jobHuntDialogs']['errors'];

type RenameJobHuntVMOptions = {
  jobHunt?: JobHuntSummary;
  onSuccess: () => void;
};

export function useRenameJobHuntVM(
  messages: RenameJobHuntMessages,
  errors: JobHuntErrorMessages,
  { jobHunt, onSuccess }: RenameJobHuntVMOptions,
) {
  const t = useTranslations('validation');
  const schema = buildJobHuntNameSchema({
    name: { required: t('required', { object: messages.nameLabel }) },
  });

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: jobHunt?.name ?? '' },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof schema>) => {
    if (!jobHunt) {
      return;
    }

    startTransition(async () => {
      const result = await renameJobHuntAction({ id: jobHunt.id, name: values.name });

      if (result.status === 'error') {
        toast.error(resolveErrorMessage(t, errors, result.errorKey));

        return;
      }

      router.refresh();
      onSuccess();
    });
  };

  return { control, Form, isPending, onSubmit };
}
