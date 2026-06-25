'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { resetPasswordAction } from '@/src/features/auth/actions/resetPasswordAction';
import { resolveErrorMessage } from '@/src/features/auth/utils/resolveMessage';
import { useForm } from '@/src/lib/form/hooks/useForm';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { toast } from '@/src/lib/sonner/toast';
import { zPassword } from '@/src/lib/zod/schemas/primitive';
import { passwordMessages } from '@/src/lib/zod/validationMessages';

type NewPasswordMessages = ClientMessages['auth']['shared'] & ClientMessages['auth']['newPassword'];

export function useNewPasswordVM(messages: NewPasswordMessages, token: string) {
  const t = useTranslations('validation');
  const schema = z
    .object({
      password: zPassword(passwordMessages(t, messages.label)),
      confirmPassword: z.string().min(1, t('required', { object: messages.confirmLabel })),
    })
    .refine((values) => values.password === values.confirmPassword, {
      message: messages.passwordsMustMatch,
      path: ['confirmPassword'],
    });

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = (values: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = await resetPasswordAction({ token, newPassword: values.password });

      if (result.status === 'error') {
        toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));

        return;
      }

      toast.success(messages.resetSuccess);
      router.push('/sign-in');
    });
  };

  return { control, Form, isPending, onSubmit };
}
