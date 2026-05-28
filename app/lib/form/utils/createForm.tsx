'use client';

import { type ComponentProps, type ReactElement } from 'react';

import {
  type FieldValues,
  type SubmitErrorHandler,
  type SubmitHandler,
  type UseFormHandleSubmit,
} from 'react-hook-form';

import { FormIdContext } from '../hooks/useFormId';

export type FormProps<TFieldValues extends FieldValues, TTransformedValues> = Omit<
  ComponentProps<'form'>,
  'onSubmit'
> & {
  onSubmit: SubmitHandler<TTransformedValues>;
  onInvalid?: SubmitErrorHandler<TFieldValues>;
};

export type FormComponent<TFieldValues extends FieldValues, TTransformedValues> = (
  props: FormProps<TFieldValues, TTransformedValues>,
) => ReactElement;

export function createForm<TFieldValues extends FieldValues, TTransformedValues>(
  handleSubmit: UseFormHandleSubmit<TFieldValues, TTransformedValues>,
  id: string,
): FormComponent<TFieldValues, TTransformedValues> {
  return function Form({ onSubmit, onInvalid, children, ...rest }) {
    return (
      <FormIdContext value={id}>
        <form {...rest} onSubmit={handleSubmit(onSubmit, onInvalid)}>
          {children}
        </form>
      </FormIdContext>
    );
  };
}
