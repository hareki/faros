'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type z } from 'zod';

import { startJobHuntAction } from '@/app/features/job-hunt/actions/startJobHuntAction';
import { buildJobHuntNameSchema } from '@/app/features/job-hunt/schemas/jobHuntName';
import { resolveErrorMessage } from '@/app/features/job-hunt/utils/resolveMessage';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';
import { toast } from '@/app/lib/sonner/toast';

type StartJobHuntMessages = ClientMessages['layout']['jobHuntDialogs']['start'];
type JobHuntErrorMessages = ClientMessages['layout']['jobHuntDialogs']['errors'];

export function useStartJobHuntVM(
  messages: StartJobHuntMessages,
  errors: JobHuntErrorMessages,
  onSuccess: () => void,
) {
  const t = useTranslations('validation');
  const schema = buildJobHuntNameSchema({
    name: { required: t('required', { object: messages.nameLabel }) },
  });

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = await startJobHuntAction({ name: values.name });

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
