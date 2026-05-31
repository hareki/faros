'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations, type Messages } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { resetPasswordAction } from '@/app/features/auth/actions/resetPasswordAction';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { zPassword } from '@/app/lib/zod/schemas/primitive';

type NewPasswordMessages = Messages['ClientAuthentication'] & Messages['ClientNewPassword'];

export function useNewPasswordVM(messages: NewPasswordMessages, token: string) {
  const t = useTranslations('GlobalValidation');
  const schema = z
    .object({
      password: zPassword(t, messages.label),
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
        toast.error(messages[result.errorKey]);

        return;
      }

      toast.success(messages.resetSuccess);
      router.push('/sign-in');
    });
  };

  return { control, Form, isPending, onSubmit };
}
