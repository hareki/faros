'use client';

import { useEffect, useState, useTransition, type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, type Messages } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useWatch } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import Button from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { requestPasswordResetAction } from '@/app/features/auth/actions/requestPasswordResetAction';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { useForm } from '@/app/lib/form/hooks/useForm';

import AuthFormWrapperView from './AuthFormWrapperView';
import CheckEmailView from './CheckEmailView';

type ResetPasswordFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  messages: Messages['ClientAuthentication'] & Messages['ClientForgotPassword'];
};

export default function ResetPasswordFormView({
  title,
  subtitle,
  messages,
}: ResetPasswordFormProps) {
  const t = useTranslations('GlobalValidation');
  const schema = z.object({
    email: z
      .string()
      .min(1, t('required', { object: messages.email }))
      .pipe(z.email(t('objectInvalid', { object: messages.email }))),
  });

  // Keep the email field in sync with the `?email=` query param so the value
  // survives reloads and can be shared/prefilled via the URL.
  const [emailParam, setEmailParam] = useQueryState('email', parseAsString.withDefault(''));

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: emailParam },
  });

  const email = useWatch({ control, name: 'email' });

  useEffect(() => {
    void setEmailParam(email);
  }, [email, setEmailParam]);

  const [isPending, startTransition] = useTransition();

  // Once the request is sent we swap to the "check your email" confirmation.
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  const onSubmit = (values: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = await requestPasswordResetAction(values);

      if (result.status === 'error') {
        toast.error(messages[result.errorKey]);

        return;
      }

      setSentToEmail(values.email);
    });
  };

  if (sentToEmail) {
    return <CheckEmailView email={sentToEmail} messages={messages} />;
  }

  return (
    <AuthFormWrapperView messages={messages} title={title} subtitle={subtitle}>
      <Form onSubmit={onSubmit}>
        <FieldGroup>
          <FormTextField
            control={control}
            name='email'
            label={messages.email}
            inputProps={{
              type: 'email',
              autoComplete: 'email',
              placeholder: messages.emailPlaceholder,
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
