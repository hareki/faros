import { type ComponentProps } from 'react';

import { Input as InputPrimitive } from '@base-ui/react/input';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/lib/tailwind/utils';

import { inputVariants } from './variants';

function Input({
  className,
  type,
  variant = 'default',
  ...props
}: ComponentProps<'input'> & VariantProps<typeof inputVariants>) {
  return (
    <InputPrimitive
      type={type}
      data-slot='input'
      className={cn(inputVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Input };
