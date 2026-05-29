'use client';

import { startTransition, useState, type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight, IconMail } from '@tabler/icons-react';
import LinkPrimitive from 'next/link';
import { useTranslations, type Messages } from 'next-intl';
import { z } from 'zod';

import Button from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { useForm } from '@/app/lib/form/hooks/useForm';

import AuthFormWrapperView, { type SocialProvider } from './AuthFormWrapperView';

type SignUpFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  messages: Messages['ClientAuth'];
};

export default function SignUpFormView({ title, subtitle, footer, messages }: SignUpFormProps) {
  const t = useTranslations('GlobalValidation');
  const schema = z.object({
    email: z
      .string()
      .min(1, t('required', { object: messages.email }))
      .pipe(z.email(t('objectInvalid', { object: messages.email }))),
    password: z.string().min(1, t('required', { object: messages.password })),
  });

  const [{ control, getValues }, Form] = useForm({
    resolver: zodResolver(schema),
  });

  // Once sign-up succeeds we swap to the "check your email" confirmation state.
  // `null` means we're still showing the form; a string holds the address we
  // sent the verification link to.
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  const onSubmit = (values: z.infer<typeof schema>) => {
    // TODO: replace with authClient.signUp.email({ email, password })
    console.log('[mock] sign-up', values);
  };

  const onSocialSignIn = (provider: SocialProvider) => {
    // TODO: replace with authClient.signIn.social({ provider })
    console.log('[mock] social sign-up', provider);
  };

  // TEMP: no sign-up logic exists yet, so this bypasses validation and the
  // backend call to jump straight to the confirmation state for testing.
  // Remove once `onSubmit` actually creates the account.
  const onBypassSubmit = () => {
    const email = getValues('email') || messages.emailPlaceholder;

    startTransition(() => {
      setSentToEmail(email);
    });
  };

  if (sentToEmail) {
    return (
      <AuthFormWrapperView
        messages={messages}
        icon={<IconMail className='size-12' stroke={1.5} />}
        title={messages.checkEmailTitle}
        subtitle={messages.checkEmailSubtitle.replace('{email}', sentToEmail)}
      >
        <div className='flex-center'>
          <Button nativeButton={false} render={<LinkPrimitive href='/sign-in' />}>
            {messages.goToLogin}
            <IconArrowRight />
          </Button>
        </div>
      </AuthFormWrapperView>
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

          {/* TEMP: type='button' + onBypassSubmit short-circuits to the
              confirmation state. Restore type='submit' (and drop onClick) once
              real sign-up wiring lands in `onSubmit`. */}
          <Button type='button' className='w-full' onClick={onBypassSubmit}>
            {messages.signUpSubmit}
          </Button>
        </FieldGroup>
      </Form>
    </AuthFormWrapperView>
  );
}
