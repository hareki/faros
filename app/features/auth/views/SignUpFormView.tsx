'use client';

import { type ReactNode } from 'react';

import { IconArrowRight } from '@tabler/icons-react';
import LinkPrimitive from 'next/link';

import { Button } from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { useSignUpVM } from '@/app/features/auth/view-models/useSignUpVM';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { type ClientMessages } from '@/app/lib/next-intl/utils/clientMessages';

import { AuthFormWrapperView } from './AuthFormWrapperView';
import { CheckEmailView } from './CheckEmailView';

type SignUpFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  messages: ClientMessages['auth']['shared'] & ClientMessages['auth']['signUp'];
};

export function SignUpFormView({ title, subtitle, footer, messages }: SignUpFormProps) {
  const { control, Form, isPending, sentToEmail, onSubmit, onSocialSignIn, onResend } =
    useSignUpVM(messages);

  if (sentToEmail) {
    return (
      <CheckEmailView messages={messages} email={sentToEmail}>
        <div className='flex flex-col items-center gap-3'>
          <Button variant='secondary' className='w-full' loading={isPending} onClick={onResend}>
            {messages.resendEmail}
          </Button>
          <Button nativeButton={false} render={<LinkPrimitive href='/sign-in' />}>
            {messages.goToLogin}
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
            inputProps={{
              type: 'password',
              autoComplete: 'new-password',
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
