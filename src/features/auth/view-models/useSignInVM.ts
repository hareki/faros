'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { type z } from 'zod';

import { resendVerificationEmailAction } from '@/src/features/auth/actions/resendVerificationEmailAction';
import { signInAction } from '@/src/features/auth/actions/signInAction';
import { buildSignInSchema } from '@/src/features/auth/schemas/signIn';
import { resolveErrorMessage } from '@/src/features/auth/utils/resolveMessage';
import { type SupportedSocialProvider, socialSignIn } from '@/src/lib/better-auth/social';
import { useForm } from '@/src/lib/form/hooks/useForm';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { toast } from '@/src/lib/sonner/toast';
import { emailMessages } from '@/src/lib/zod/validationMessages';

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
        toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));

        return;
      }

      router.push('/dashboard');
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
        toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));

        return;
      }

      toast.success(messages.resendEmailSuccess);
    });
  };

  return { control, Form, isPending, unverifiedEmail, onSubmit, onSocialSignIn, onResend };
}
