'use client';

import { useEffect, useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { z } from 'zod';

import { requestPasswordResetAction } from '@/src/features/auth/actions/requestPasswordResetAction';
import { resolveErrorMessage } from '@/src/features/auth/utils/resolveMessage';
import { useForm } from '@/src/lib/form/hooks/useForm';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { toast } from '@/src/lib/sonner/toast';
import { zEmail } from '@/src/lib/zod/schemas/primitive';
import { emailMessages } from '@/src/lib/zod/validationMessages';

type ResetPasswordMessages = ClientMessages['auth']['shared'] &
  ClientMessages['auth']['resetPassword'];

export function useResetPasswordVM(messages: ResetPasswordMessages) {
  const t = useTranslations('validation');
  const schema = z.object({
    email: zEmail(emailMessages(t, messages.email)),
  });

  const [sentToEmail, setSentToEmail] = useState<string | null>(null);
  const [emailParam, setEmailParam] = useQueryState('email', parseAsString.withDefault(''));

  const [{ control, subscribe }, Form] = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: emailParam },
  });

  useEffect(() => {
    const unsubscribe = subscribe({
      name: 'email',
      formState: { values: true },
      callback: ({ values: { email } }) => {
        void setEmailParam(email);
      },
    });

    return () => {
      unsubscribe();
    };
  }, [setEmailParam, subscribe]);

  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = await requestPasswordResetAction(values);

      if (result.status === 'error') {
        toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));

        return;
      }

      setSentToEmail(values.email);
    });
  };

  return { control, Form, isPending, sentToEmail, onSubmit };
}
