'use client';

import { useTransition, type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations, type Messages } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import Button from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { resetPasswordAction } from '@/app/features/auth/actions/resetPasswordAction';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { useForm } from '@/app/lib/form/hooks/useForm';

import AuthFormWrapperView from './AuthFormWrapperView';

type NewPasswordFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  messages: Messages['ClientAuthentication'] & Messages['ClientNewPassword'];
  // Reset token lifted from the `?token=` query param by the page.
  token: string;
};

export default function NewPasswordFormView({
  title,
  subtitle,
  messages,
  token,
}: NewPasswordFormProps) {
  const t = useTranslations('GlobalValidation');
  const schema = z
    .object({
      password: z.string().min(1, t('required', { object: messages.label })),
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

  return (
    <AuthFormWrapperView messages={messages} title={title} subtitle={subtitle}>
      <Form onSubmit={onSubmit}>
        <FieldGroup>
          <FormTextField
            control={control}
            name='password'
            label={messages.label}
            inputProps={{
              type: 'password',
              autoComplete: 'new-password',
              placeholder: messages.placeholder,
            }}
          />

          <FormTextField
            control={control}
            name='confirmPassword'
            label={messages.confirmLabel}
            inputProps={{
              type: 'password',
              autoComplete: 'new-password',
              placeholder: messages.confirmPlaceholder,
            }}
          />

          <Button type='submit' className='w-full' disabled={isPending}>
            {messages.submit}
          </Button>
        </FieldGroup>
      </Form>
    </AuthFormWrapperView>
  );
}
