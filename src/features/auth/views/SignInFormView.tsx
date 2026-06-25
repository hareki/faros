'use client';

import { type ReactNode } from 'react';

import { IconArrowRight } from '@tabler/icons-react';

import { Button } from '@/src/components/ui/Button';
import { FieldGroup } from '@/src/components/ui/Field';
import { Link } from '@/src/components/ui/Link';
import { useSignInVM } from '@/src/features/auth/view-models/useSignInVM';
import { FormTextField } from '@/src/lib/form/components/FormTextField';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { AuthFormWrapperView } from './AuthFormWrapperView';
import { CheckEmailView } from './CheckEmailView';

type SignInFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  messages: ClientMessages['auth']['shared'] & ClientMessages['auth']['signIn'];
};

export function SignInForm({ title, subtitle, footer, messages }: SignInFormProps) {
  const { control, Form, isPending, unverifiedEmail, onSubmit, onSocialSignIn, onResend } =
    useSignInVM(messages);

  if (unverifiedEmail) {
    return (
      <CheckEmailView messages={messages} email={unverifiedEmail}>
        <div className='flex-center'>
          <Button variant='secondary' loading={isPending} onClick={onResend}>
            {messages.resendEmail}
            <IconArrowRight />
          </Button>
        </div>
      </CheckEmailView>
    );
  }

  return (
    <AuthFormWrapperView
      messages={messages}
      title={title}
      subtitle={subtitle}
      footer={footer}
      onSocialClick={onSocialSignIn}
    >
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

          <FormTextField
            control={control}
            name='password'
            label={messages.password}
            labelAddon={
              <Link variant='action' href='/reset-password'>
                Forgot your password?
              </Link>
            }
            inputProps={{
              type: 'password',
              autoComplete: 'current-password',
              placeholder: messages.passwordPlaceholder,
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
