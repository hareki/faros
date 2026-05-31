'use client';

import { type ReactNode } from 'react';

import { type Messages } from 'next-intl';

import Button from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { useResetPasswordVM } from '@/app/features/auth/view-models/useResetPasswordVM';
import { FormTextField } from '@/app/lib/form/components/FormTextField';

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
  const { control, Form, isPending, sentToEmail, onSubmit } = useResetPasswordVM(messages);

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
