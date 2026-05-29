'use client';

import { useEffect, type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, type Messages } from 'next-intl';
import { parseAsString, useQueryState } from 'nuqs';
import { useWatch } from 'react-hook-form';
import { z } from 'zod';

import Button from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { useForm } from '@/app/lib/form/hooks/useForm';

import AuthFormWrapperView from './AuthFormWrapperView';

type ResetPasswordFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  messages: Messages['ClientAuth'];
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

  const onSubmit = (values: z.infer<typeof schema>) => {
    // TODO: replace with authClient.forgetPassword({ email, redirectTo })
    console.log('[mock] reset-password', values);
  };

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

          <Button type='submit' className='w-full'>
            {messages.resetPasswordSubmit}
          </Button>
        </FieldGroup>
      </Form>
    </AuthFormWrapperView>
  );
}
