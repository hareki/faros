'use client';

import { type ReactNode } from 'react';

import { IconArrowRight } from '@tabler/icons-react';
import { type Messages } from 'next-intl';

import { Button } from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import Link from '@/app/components/ui/Link';
import { useSignInVM } from '@/app/features/auth/view-models/useSignInVM';
import { FormTextField } from '@/app/lib/form/components/FormTextField';

import AuthFormWrapperView from './AuthFormWrapperView';
import CheckEmailView from './CheckEmailView';

type SignInFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  messages: Messages['ClientAuthentication'] & Messages['ClientSignIn'];
};

export default function SignInForm({ title, subtitle, footer, messages }: SignInFormProps) {
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
