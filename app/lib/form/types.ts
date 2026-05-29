import { type ReactNode } from 'react';

import { type FieldPath, type FieldValues, type Control } from 'react-hook-form';

import type { XOR } from 'ts-xor';

export type FormInputProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  InputProps extends Record<string, any> = never,
> = {
  control: Control<TFieldValues>;
  name: TName;

  description?: string;
  disabled?: boolean;

  inputProps?: InputProps;
} & XOR<{ label?: string }, { label: string; labelAddon?: ReactNode }>;
