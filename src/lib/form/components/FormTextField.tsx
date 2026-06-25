'use client';

import { type ComponentProps } from 'react';

import { Controller, type FieldPath, type FieldPathValue, type FieldValues } from 'react-hook-form';

import { Field, FieldDescription, FieldError, FieldLabel } from '@/src/components/ui/Field';
import { Input } from '@/src/components/ui/Input';

import { useFormId } from '../hooks/useFormId';
import { type FormInputProps } from '../types';

type FormTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = FormInputProps<
  TFieldValues,
  TName,
  Omit<
    ComponentProps<typeof Input>,
    'id' | 'name' | 'value' | 'onChange' | 'onBlur' | 'ref' | 'aria-invalid'
  >
>;

export function FormTextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  label,
  labelAddon,
  description,
  disabled,
  inputProps,
}: FormTextFieldProps<TFieldValues, TName>) {
  const id = `${useFormId()}-${name}`;

  return (
    <Controller
      control={control}
      name={name}
      disabled={disabled}
      // This is the last fallback, `useForm({ defaultValues })` still take precedence if provided
      // Useful place to provide common `defaultValue` without redeclaring them every single time in useForm
      defaultValue={'' as FieldPathValue<TFieldValues, TName>}
      render={({ field, fieldState }) => {
        const labelJsx = label && <FieldLabel htmlFor={id}>{label}</FieldLabel>;

        return (
          <Field>
            {label && labelAddon && (
              <div className='flex justify-between'>
                {labelJsx}
                {labelAddon}
              </div>
            )}
            {label && !labelAddon && labelJsx}

            <Input id={id} aria-invalid={!!fieldState.error} {...inputProps} {...field} />
            {description && <FieldDescription>{description}</FieldDescription>}
            <FieldError errors={[fieldState.error]} />
          </Field>
        );
      }}
    />
  );
}
