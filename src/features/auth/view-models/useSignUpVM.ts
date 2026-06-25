'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { type z } from 'zod';

import { resendVerificationEmailAction } from '@/src/features/auth/actions/resendVerificationEmailAction';
import { signUpAction } from '@/src/features/auth/actions/signUpAction';
import { buildSignUpSchema } from '@/src/features/auth/schemas/signUp';
import { resolveErrorMessage } from '@/src/features/auth/utils/resolveMessage';
import { type SupportedSocialProvider, socialSignIn } from '@/src/lib/better-auth/social';
import { useForm } from '@/src/lib/form/hooks/useForm';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { toast } from '@/src/lib/sonner/toast';
import { emailMessages, passwordMessages } from '@/src/lib/zod/validationMessages';

type SignUpMessages = ClientMessages['auth']['shared'] & ClientMessages['auth']['signUp'];

export function useSignUpVM(messages: SignUpMessages) {
  const t = useTranslations('validation');
  const schema = buildSignUpSchema({
    email: emailMessages(t, messages.email),
    password: passwordMessages(t, messages.password),
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
        toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));

        return;
      }

      setSentToEmail(values.email);
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
    if (!sentToEmail) {
      return;
    }

    startTransition(async () => {
      const result = await resendVerificationEmailAction({ email: sentToEmail });

      if (result.status === 'error') {
        toast.error(resolveErrorMessage(t, messages.errors, result.errorKey));

        return;
      }

      toast.success(messages.resendEmailSuccess);
    });
  };

  return { control, Form, isPending, sentToEmail, onSubmit, onSocialSignIn, onResend };
}
