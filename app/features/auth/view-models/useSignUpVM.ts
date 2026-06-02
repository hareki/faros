'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, type Messages } from 'next-intl';
import { toast } from 'sonner';
import { type z } from 'zod';

import { resendVerificationEmailAction } from '@/app/features/auth/actions/resendVerificationEmailAction';
import { signUpAction } from '@/app/features/auth/actions/signUpAction';
import { buildSignUpSchema } from '@/app/features/auth/schemas/signUp';
import { resolveErrorMessage } from '@/app/features/auth/utils/resolveMessage';
import { type SupportedSocialProvider, socialSignIn } from '@/app/lib/better-auth/social';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { emailMessages, passwordMessages } from '@/app/lib/zod/validationMessages';

type SignUpMessages = Messages['ClientAuthentication'] & Messages['ClientSignUp'];

export function useSignUpVM(messages: SignUpMessages) {
  const t = useTranslations('GlobalValidation');
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
        toast.error(resolveErrorMessage(t, messages, result.errorKey));

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
        toast.error(resolveErrorMessage(t, messages, result.errorKey));

        return;
      }

      toast.success(messages.resendEmailSuccess);
    });
  };

  return { control, Form, isPending, sentToEmail, onSubmit, onSocialSignIn, onResend };
}
