import { type FieldPath, type FieldValues, type Control } from 'react-hook-form';

export type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  InputProps extends Record<string, any> = never,
> = {
  control: Control<TFieldValues>;
  name: TName;

  label?: string;
  description?: string;
  disabled?: boolean;

  inputProps?: InputProps;
};
