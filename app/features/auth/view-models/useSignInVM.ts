'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type z } from 'zod';

import { resendVerificationEmailAction } from '@/app/features/auth/actions/resendVerificationEmailAction';
import { signInAction } from '@/app/features/auth/actions/signInAction';
import { buildSignInSchema } from '@/app/features/auth/schemas/signIn';
import { resolveErrorMessage } from '@/app/features/auth/utils/resolveMessage';
import { type SupportedSocialProvider, socialSignIn } from '@/app/lib/better-auth/social';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { type ClientMessages } from '@/app/lib/next-intl/clientMessages';
import { toast } from '@/app/lib/sonner/toast';
import { emailMessages } from '@/app/lib/zod/validationMessages';

type SignInMessages = ClientMessages['auth']['shared'] & ClientMessages['auth']['signIn'];

export function useSignInVM(messages: SignInMessages) {
  const t = useTranslations('validation');
  const schema = buildSignInSchema({
    email: emailMessages(t, messages.email),
    password: { required: t('required', { object: messages.password }) },
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
        toast.error(resolveErrorMessage(t, messages, result.errorKey));

        return;
      }

      router.push('/');
      router.refresh();
    });
  };

  const onSocialSignIn = (provider: SupportedSocialProvider) => {
    startTransition(async () => {
      try {
        await socialSignIn(provider);
      } catch {
        toast.error(t('errorGeneric'));
      }
    });
  };

  const onResend = () => {
    if (!unverifiedEmail) {
      return;
    }

    startTransition(async () => {
      const result = await resendVerificationEmailAction({ email: unverifiedEmail });

      if (result.status === 'error') {
        toast.error(resolveErrorMessage(t, messages, result.errorKey));

        return;
      }

      toast.success(messages.resendEmailSuccess);
    });
  };

  return { control, Form, isPending, unverifiedEmail, onSubmit, onSocialSignIn, onResend };
}
