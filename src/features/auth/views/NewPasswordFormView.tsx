'use client';

import { type ReactNode } from 'react';

import { Button } from '@/src/components/ui/Button';
import { FieldGroup } from '@/src/components/ui/Field';
import { useNewPasswordVM } from '@/src/features/auth/view-models/useNewPasswordVM';
import { FormTextField } from '@/src/lib/form/components/FormTextField';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { AuthFormWrapperView } from './AuthFormWrapperView';

type NewPasswordFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  messages: ClientMessages['auth']['shared'] & ClientMessages['auth']['newPassword'];
  // Reset token lifted from the `?token=` query param by the page.
  token: string;
};

export function NewPasswordFormView({ title, subtitle, messages, token }: NewPasswordFormProps) {
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

          <Button type='submit' className='w-full' loading={isPending}>
            {messages.submit}
          </Button>
        </FieldGroup>
      </Form>
    </AuthFormWrapperView>
  );
}
