'use client';

import { useEffect, useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, type Messages } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { z } from 'zod';

import { requestPasswordResetAction } from '@/app/features/auth/actions/requestPasswordResetAction';
import { resolveErrorMessage } from '@/app/features/auth/utils/resolveMessage';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { toast } from '@/app/lib/sonner/toast';
import { zEmail } from '@/app/lib/zod/schemas/primitive';
import { emailMessages } from '@/app/lib/zod/validationMessages';

type ResetPasswordMessages = Messages['ClientAuthentication'] & Messages['ClientForgotPassword'];

export function useResetPasswordVM(messages: ResetPasswordMessages) {
  const t = useTranslations('GlobalValidation');
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
        toast.error(resolveErrorMessage(t, messages, result.errorKey));

        return;
      }

      setSentToEmail(values.email);
    });
  };

  return { control, Form, isPending, sentToEmail, onSubmit };
}
