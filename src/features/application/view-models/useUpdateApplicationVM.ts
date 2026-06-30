'use client';

import { useTransition } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { z } from 'zod';

import { updateApplicationAction } from '@/src/features/application/actions/updateApplicationAction';
import { type ApplicationDetail } from '@/src/features/application/db/queries';
import { applicationSource, workingModel } from '@/src/features/application/db/schema';
import { useForm } from '@/src/lib/form/hooks/useForm';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';
import { resolveErrorMessage } from '@/src/lib/next-intl/utils/resolveErrorMessage';
import { toast } from '@/src/lib/sonner/toast';

type UpdateApplicationMessages = ClientMessages['applicationDetail'];

type UpdateApplicationSchemaMessages = {
  companyRequired: string;
  roleRequired: string;
  jdUrlInvalid: string;
  salaryMinInvalid: string;
  salaryMaxInvalid: string;
};

// Validates the raw form values: text fields stay strings and enums are nullable.
// `onSubmit` then coerces these into the action's `number | null` / nullable-text shape.
function buildUpdateApplicationSchema(messages: UpdateApplicationSchemaMessages) {
  const positiveAmount = (invalid: string) =>
    z.string().refine((value) => {
      const trimmed = value.trim();

      if (trimmed === '') {
        return true;
      }

      const parsed = Number(trimmed);

      return Number.isFinite(parsed) && parsed > 0;
    }, invalid);

  return z.object({
    company: z.string().trim().min(1, messages.companyRequired).max(200),
    role: z.string().trim().min(1, messages.roleRequired).max(200),
    source: z.enum(applicationSource.enumValues).nullable(),
    jdUrl: z.string().refine((value) => {
      if (value.trim() === '') {
        return true;
      }

      return z.url().safeParse(value).success;
    }, messages.jdUrlInvalid),
    jdText: z.string(),
    location: z.string().max(200),
    workingModel: z.enum(workingModel.enumValues).nullable(),
    salaryMin: positiveAmount(messages.salaryMinInvalid),
    salaryMax: positiveAmount(messages.salaryMaxInvalid),
    salaryCurrency: z.string().max(8),
    notes: z.string().nullable(),
  });
}

// Raw form value shape for the application metadata editor (before submit coercion).
type UpdateApplicationFormValues = z.infer<ReturnType<typeof buildUpdateApplicationSchema>>;

const toNullableText = (value: string): string | null => {
  const trimmed = value.trim();

  return trimmed === '' ? null : trimmed;
};

const toNullableAmount = (value: string): number | null => {
  const trimmed = value.trim();

  return trimmed === '' ? null : Number(trimmed);
};

/**
 * Form view-model for editing one application's metadata (including Lexical notes), saved via
 * `updateApplicationAction`. Coerces empty strings to `null` and numeric strings to numbers to
 * match the action schema, surfaces errors as toasts, and refreshes the route on success.
 */
export function useUpdateApplicationVM(
  detail: ApplicationDetail,
  messages: UpdateApplicationMessages,
) {
  const t = useTranslations('validation');

  const schema = buildUpdateApplicationSchema({
    companyRequired: t('required', { object: messages.fields.company }),
    roleRequired: t('required', { object: messages.fields.role }),
    jdUrlInvalid: t('objectInvalid', { object: messages.fields.jdUrl }),
    salaryMinInvalid: t('objectInvalid', { object: messages.fields.salaryMin }),
    salaryMaxInvalid: t('objectInvalid', { object: messages.fields.salaryMax }),
  });

  const [{ control }, Form, formId] = useForm<UpdateApplicationFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      company: detail.company,
      role: detail.role,
      source: detail.source,
      jdUrl: detail.jdUrl ?? '',
      jdText: detail.jdText ?? '',
      location: detail.location ?? '',
      workingModel: detail.workingModel,
      salaryMin: detail.salaryMin === null ? '' : String(detail.salaryMin),
      salaryMax: detail.salaryMax === null ? '' : String(detail.salaryMax),
      salaryCurrency: detail.salaryCurrency ?? '',
      notes: detail.notes,
    },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // The action's error union (ApplicationErrorKey) is wider than this surface's message
  // map, so widen to a string-keyed record for the shared resolver. In practice the only
  // application-specific key this action returns is `errorApplicationNotFound`.
  const errorMessages: Record<string, string> = messages.errors;

  const onSubmit = (values: UpdateApplicationFormValues) => {
    startTransition(async () => {
      const result = await updateApplicationAction({
        id: detail.id,
        company: values.company.trim(),
        role: values.role.trim(),
        source: values.source,
        jdUrl: toNullableText(values.jdUrl),
        jdText: toNullableText(values.jdText),
        location: toNullableText(values.location),
        workingModel: values.workingModel,
        salaryMin: toNullableAmount(values.salaryMin),
        salaryMax: toNullableAmount(values.salaryMax),
        salaryCurrency: toNullableText(values.salaryCurrency),
        notes: values.notes,
      });

      if (result.status === 'error') {
        toast.error(resolveErrorMessage(t, errorMessages, result.errorKey));

        return;
      }

      toast.success(messages.saved);
      router.refresh();
    });
  };

  return { control, Form, formId, isPending, onSubmit };
}
