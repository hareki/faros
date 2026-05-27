'use client';

import { type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, type Messages } from 'next-intl';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import Button from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/input';

import AuthFormWrapperView, { type SocialProvider } from './AuthFormWrapperView';

type SignInFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  messages: Messages['ClientAuth'];
};

export default function SignInForm({ title, subtitle, footer, messages }: SignInFormProps) {
  const t = useTranslations('GlobalValidation');
  const schema = z.object({
    email: z
      .string()
      .min(1, t('required', { object: messages.email }))
      .pipe(z.email(t('objectInvalid', { object: messages.email }))),
    password: z.string().min(1, t('required', { object: messages.password })),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    // TODO: replace with authClient.signIn.email({ email, password })
    console.log('[mock] sign-in', values);
  });

  const onSocialSignIn = (provider: SocialProvider) => {
    // TODO: replace with authClient.signIn.social({ provider })
    console.log('[mock] social sign-in', provider);
  };

  return (
    <AuthFormWrapperView
      messages={messages}
      title={title}
      subtitle={subtitle}
      footer={footer}
      onSocialClick={onSocialSignIn}
    >
      <form onSubmit={onSubmit} className='flex flex-col gap-4'>
        <div className='flex flex-col gap-1.5'>
          <label htmlFor='email' className='text-sm font-medium'>
            {messages.email}
          </label>
          <Input
            id='email'
            type='email'
            autoComplete='email'
            placeholder={messages.emailPlaceholder}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          {errors.email ? <p className='text-sm text-destructive'>{errors.email.message}</p> : null}
        </div>

        <div className='flex flex-col gap-1.5'>
          <label htmlFor='password' className='text-sm font-medium'>
            {messages.password}
          </label>
          <Input
            id='password'
            type='password'
            autoComplete='current-password'
            placeholder={messages.passwordPlaceholder}
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          {errors.password ? (
            <p className='text-sm text-destructive'>{errors.password.message}</p>
          ) : null}
        </div>

        <Button type='submit' className='w-full'>
          {messages.signInSubmit}
        </Button>
      </form>
    </AuthFormWrapperView>
  );
}
