'use client';

import { useState, useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations, type Messages } from 'next-intl';
import { toast } from 'sonner';
import { z } from 'zod';

import { resendVerificationEmailAction } from '@/app/features/auth/actions/resendVerificationEmailAction';
import { signUpAction } from '@/app/features/auth/actions/signUpAction';
import { type SupportedSocialProvider, socialSignIn } from '@/app/lib/better-auth/social';
import { useForm } from '@/app/lib/form/hooks/useForm';
import { zEmail, zPassword } from '@/app/lib/zod/schemas/primitive';

type SignUpMessages = Messages['ClientAuthentication'] & Messages['ClientSignUp'];

export function useSignUpVM(messages: SignUpMessages) {
  const t = useTranslations('GlobalValidation');
  const schema = z.object({
    email: zEmail(t, messages.email),
    password: zPassword(t, messages.password),
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

  const onSocialSignIn = (provider: SupportedSocialProvider) => {
    startTransition(async () => {
      try {
        await socialSignIn(provider);
      } catch {
        toast.error(messages.errorGeneric);
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
        toast.error(messages[result.errorKey]);

        return;
      }

      toast.success(messages.resendEmailSuccess);
    });
  };

  return { control, Form, isPending, sentToEmail, onSubmit, onSocialSignIn, onResend };
}
