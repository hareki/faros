'use client';

import { useState, useTransition, type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight } from '@tabler/icons-react';
import LinkPrimitive from 'next/link';
import { useTranslations, type Messages } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import Button from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import { resendVerificationEmailAction } from '@/app/features/auth/actions/resendVerificationEmailAction';
import { signUpAction } from '@/app/features/auth/actions/signUpAction';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { useForm } from '@/app/lib/form/hooks/useForm';

import AuthFormWrapperView, { type SocialProvider } from './AuthFormWrapperView';
import CheckEmailView from './CheckEmailView';

type SignUpFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  messages: Messages['ClientAuthentication'] & Messages['ClientSignUp'];
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

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
  });

  const [isPending, startTransition] = useTransition();

  // Once sign-up succeeds we swap to the "check your email" confirmation state.
  // `null` means we're still showing the form; a string holds the address we
  // sent the verification link to.
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  const onSubmit = (values: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = await signUpAction(values);

      if (result.status === 'error') {
        toast.error(messages[result.errorKey]);

        return;
      }

      setSentToEmail(values.email);
    });
  };

  const onSocialSignIn = (provider: SocialProvider) => {
    // TODO: replace with authClient.signIn.social({ provider })
    console.log('[mock] social sign-up', provider);
  };

  const onResend = () => {
    if (!sentToEmail) {
      return;
    }

    startTransition(async () => {
      const result = await resendVerificationEmailAction({ email: sentToEmail });

      if (result.status === 'error') {
        toast.error(messages[result.errorKey]);

        return;
      }

      toast.success(messages.resendEmailSuccess);
    });
  };

  if (sentToEmail) {
    return (
      <CheckEmailView messages={messages} email={sentToEmail}>
        <div className='flex flex-col items-center gap-3'>
          <Button variant='secondary' className='w-full' disabled={isPending} onClick={onResend}>
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

          <Button type='submit' className='w-full' disabled={isPending}>
            {messages.submit}
          </Button>
        </FieldGroup>
      </Form>
    </AuthFormWrapperView>
  );
}
