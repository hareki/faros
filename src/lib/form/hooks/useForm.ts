import { useId } from 'react';

import {
  useForm as useReactHookForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';

import { type FormComponent, createForm } from '../utils/createForm';

export type UseFormReturnWithForm<
  TFieldValues extends FieldValues,
  TContext,
  TTransformedValues,
> = [
  UseFormReturn<TFieldValues, TContext, TTransformedValues>,
  FormComponent<TFieldValues, TTransformedValues>,
  string, // Form Id
];

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
): UseFormReturnWithForm<TFieldValues, TContext, TTransformedValues> {
  const id = useId();
  const form = useReactHookForm<TFieldValues, TContext, TTransformedValues>({
    mode: 'onSubmit',
    ...props,
  });
  const Form = createForm(form.handleSubmit, id);

  return [form, Form, id];
}
