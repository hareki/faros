import {
  useForm as useReactHookForm,
  type FieldValues,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';

export function useForm<
  TFieldValues extends FieldValues = FieldValues,
  TContext = any,
  TTransformedValues = TFieldValues,
>(
  props?: UseFormProps<TFieldValues, TContext, TTransformedValues>,
): UseFormReturn<TFieldValues, TContext, TTransformedValues> {
  return useReactHookForm<TFieldValues, TContext, TTransformedValues>({
    mode: 'onTouched',
    ...props,
  });
}
