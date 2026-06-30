'use client';

import { Controller } from 'react-hook-form';

import { Button } from '@/src/components/ui/Button';
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/src/components/ui/Combobox';
import { Field, FieldError, FieldGroup, FieldLabel, FieldTitle } from '@/src/components/ui/Field';
import { Textarea } from '@/src/components/ui/Textarea';
import { type ApplicationDetail } from '@/src/features/application/db/queries';
import { applicationSource, workingModel } from '@/src/features/application/db/schema';
import { useUpdateApplicationVM } from '@/src/features/application/view-models/useUpdateApplicationVM';
import { FormTextField } from '@/src/lib/form/components/FormTextField';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

import { NotesEditor } from './NotesEditor';

type ApplicationMetadataFormProps = {
  detail: ApplicationDetail;
  messages: ClientMessages['applicationDetail'];
  sourceMessages: ClientMessages['trackerBoard']['sources'];
  readOnly: boolean;
};

/**
 * Single RHF form over an application's editable metadata, including the Lexical notes editor.
 * Saves through `updateApplicationAction`; every control is disabled when `readOnly`.
 */
export function ApplicationMetadataForm({
  detail,
  messages,
  sourceMessages,
  readOnly,
}: ApplicationMetadataFormProps) {
  const { control, Form, formId, isPending, onSubmit } = useUpdateApplicationVM(detail, messages);

  return (
    <Form onSubmit={onSubmit} className='flex flex-col gap-6'>
      <FieldGroup>
        <FormTextField
          control={control}
          name='company'
          label={messages.fields.company}
          disabled={readOnly}
        />
        <FormTextField
          control={control}
          name='role'
          label={messages.fields.role}
          disabled={readOnly}
        />

        <Controller
          control={control}
          name='source'
          disabled={readOnly}
          render={({ field, fieldState }) => (
            <EnumCombobox
              id={`${formId}-source`}
              label={messages.fields.source}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={applicationSource.enumValues}
              labels={sourceMessages}
              disabled={readOnly}
              error={fieldState.error}
            />
          )}
        />

        <FormTextField
          control={control}
          name='jdUrl'
          label={messages.fields.jdUrl}
          disabled={readOnly}
          inputProps={{ inputMode: 'url', placeholder: 'https://' }}
        />

        <Controller
          control={control}
          name='jdText'
          disabled={readOnly}
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={`${formId}-jdText`}>{messages.fields.jdText}</FieldLabel>
              <Textarea id={`${formId}-jdText`} aria-invalid={!!fieldState.error} {...field} />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <FormTextField
          control={control}
          name='location'
          label={messages.fields.location}
          disabled={readOnly}
        />

        <Controller
          control={control}
          name='workingModel'
          disabled={readOnly}
          render={({ field, fieldState }) => (
            <EnumCombobox
              id={`${formId}-workingModel`}
              label={messages.fields.workingModel}
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              options={workingModel.enumValues}
              labels={messages.workingModels}
              disabled={readOnly}
              error={fieldState.error}
            />
          )}
        />

        <FormTextField
          control={control}
          name='salaryMin'
          label={messages.fields.salaryMin}
          disabled={readOnly}
          inputProps={{ inputMode: 'decimal' }}
        />
        <FormTextField
          control={control}
          name='salaryMax'
          label={messages.fields.salaryMax}
          disabled={readOnly}
          inputProps={{ inputMode: 'decimal' }}
        />
        <FormTextField
          control={control}
          name='salaryCurrency'
          label={messages.fields.salaryCurrency}
          disabled={readOnly}
        />

        <Controller
          control={control}
          name='notes'
          render={({ field }) => (
            <Field>
              <FieldTitle>{messages.fields.notes}</FieldTitle>
              <NotesEditor value={field.value} onChange={field.onChange} readOnly={readOnly} />
            </Field>
          )}
        />
      </FieldGroup>

      <Button type='submit' loading={isPending} disabled={readOnly} className='self-start'>
        {messages.save}
      </Button>
    </Form>
  );
}

type EnumComboboxProps<TValue extends string> = {
  id: string;
  label: string;
  value: TValue | null;
  onChange: (next: TValue | null) => void;
  onBlur: () => void;
  options: readonly TValue[];
  labels: Record<TValue, string>;
  disabled: boolean;
  error?: { message?: string };
};

// Presentational single-select over a string enum, driven by an RHF `Controller`. Kept generic
// over the concrete value so the field's `onChange` stays precisely typed.
function EnumCombobox<TValue extends string>({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  labels,
  disabled,
  error,
}: EnumComboboxProps<TValue>) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Combobox
        items={options}
        value={value}
        multiple={false}
        onValueChange={(next: TValue | null) => {
          onChange(next);
        }}
        itemToStringLabel={(item: TValue) => labels[item]}
        disabled={disabled}
      >
        <ComboboxInput
          id={id}
          placeholder={label}
          aria-invalid={!!error}
          disabled={disabled}
          showClear={value !== null}
          onBlur={onBlur}
        />
        <ComboboxContent>
          <ComboboxEmpty />
          <ComboboxList>
            {(item: TValue) => (
              <ComboboxItem key={item} value={item}>
                {labels[item]}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <FieldError errors={[error]} />
    </Field>
  );
}
