'use client';

import { useState, useTransition, type ReactNode } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowRight } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';
import { useTranslations, type Messages } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import Button from '@/app/components/ui/Button';
import { FieldGroup } from '@/app/components/ui/Field';
import Link from '@/app/components/ui/Link';
import { resendVerificationEmailAction } from '@/app/features/auth/actions/resendVerificationEmailAction';
import { signInAction } from '@/app/features/auth/actions/signInAction';
import { FormTextField } from '@/app/lib/form/components/FormTextField';
import { useForm } from '@/app/lib/form/hooks/useForm';

import AuthFormWrapperView, { type SocialProvider } from './AuthFormWrapperView';
import CheckEmailView from './CheckEmailView';

type SignInFormProps = {
  title: ReactNode;
  subtitle: ReactNode;
  footer: ReactNode;
  messages: Messages['ClientAuthentication'];
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

  const [{ control }, Form] = useForm({
    resolver: zodResolver(schema),
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Set when sign-in is blocked because the email isn't verified yet; holds the
  // address Better Auth just (re)sent the verification link to.
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);

  const onSubmit = (values: z.infer<typeof schema>) => {
    startTransition(async () => {
      const result = await signInAction(values);

      if (result.status === 'needs-verification') {
        setUnverifiedEmail(values.email);

        return;
      }

      if (result.status === 'error') {
        toast.error(messages[result.errorKey]);

        return;
      }

      router.push('/');
      router.refresh();
    });
  };

  const onSocialSignIn = (provider: SocialProvider) => {
    // TODO: replace with authClient.signIn.social({ provider })
    console.log('[mock] social sign-in', provider);
  };

  const onResend = () => {
    if (!unverifiedEmail) {
      return;
    }

    startTransition(async () => {
      const result = await resendVerificationEmailAction({ email: unverifiedEmail });

      if (result.status === 'error') {
        toast.error(messages[result.errorKey]);

        return;
      }

      toast.success(messages.resendEmailSuccess);
    });
  };

  if (unverifiedEmail) {
    return (
      <CheckEmailView messages={messages} email={unverifiedEmail}>
        <div className='flex-center'>
          <Button variant='secondary' disabled={isPending} onClick={onResend}>
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

          <Button type='submit' className='w-full' disabled={isPending}>
            {messages.signInSubmit}
          </Button>
        </FieldGroup>
      </Form>
    </AuthFormWrapperView>
  );
}
