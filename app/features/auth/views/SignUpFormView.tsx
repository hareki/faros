'use client';

import { type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
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

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = (values: z.infer<typeof schema>) => {
    // TODO: replace with authClient.signUp.email({ email, password })
    console.log('[mock] sign-up', values);
  };

  const onSocialSignIn = (provider: SocialProvider) => {
    // TODO: replace with authClient.signIn.social({ provider })
    console.log('[mock] social sign-up', provider);
  };

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

          <Button type='submit' className='w-full'>
            {messages.signUpSubmit}
          </Button>
        </FieldGroup>
      </Form>
    </AuthFormWrapperView>
  );
}
