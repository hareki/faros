'use client';

import { type ReactNode } from 'react';

import { type Messages } from 'next-intl';

import { Button } from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { useNewPasswordVM } from '@/app/features/auth/view-models/useNewPasswordVM';
import { FormTextField } from '@/app/lib/form/components/FormTextField';

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
  const { control, Form, isPending, onSubmit } = useNewPasswordVM(messages, token);

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
