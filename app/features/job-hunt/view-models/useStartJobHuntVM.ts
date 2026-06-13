'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { type z } from 'zod';

import { buildJobHuntNameSchema } from '@/app/features/job-hunt/schemas/jobHuntName';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

type StartJobHuntMessages = ClientMessages['layout']['jobHuntDialogs']['start'];

export function useStartJobHuntVM(messages: StartJobHuntMessages, onSuccess: () => void) {
  const t = useTranslations('validation');
  const schema = buildJobHuntNameSchema({
    name: { required: t('required', { object: messages.nameLabel }) },
  });

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '' },
  });

  const [isPending, startTransition] = useTransition();

  const onSubmit = (_values: z.infer<typeof schema>) => {
    startTransition(() => {
      // TODO(todos.md L74-78): await the startJobHunt server action with _values.name.
      onSuccess();
    });
  };

  return { control, Form, isPending, onSubmit };
}
