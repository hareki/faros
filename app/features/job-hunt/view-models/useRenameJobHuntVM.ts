'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { type z } from 'zod';

import { type SketchJobHunt } from '@/app/features/job-hunt/components/sketchData';
import { buildJobHuntNameSchema } from '@/app/features/job-hunt/schemas/jobHuntName';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

type RenameJobHuntMessages = ClientMessages['layout']['jobHuntDialogs']['rename'];

type RenameJobHuntVMOptions = {
  jobHunt?: SketchJobHunt;
  onSuccess: () => void;
};

export function useRenameJobHuntVM(
  messages: RenameJobHuntMessages,
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

  const [isPending, startTransition] = useTransition();

  const onSubmit = (_values: z.infer<typeof schema>) => {
    startTransition(() => {
      // TODO(todos.md L74-78): await the renameJobHunt server action with _values.name.
      onSuccess();
    });
  };

  return { control, Form, isPending, onSubmit };
}
