import { type ReactNode, type ComponentProps } from 'react';

import { Input as InputPrimitive } from '@base-ui/react/input';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/lib/tailwind/utils';

import { inputVariants } from './variants';
import { inputGroupControlClassName, inputGroupVariants } from '../InputGroup/variants';

type AddonConfig = {
  /** Renders the input inside an input group alongside the given addon node(s), e.g. `InputGroupAddon`. */
  addon?: ReactNode;
};

function Input({
  className,
  type,
  variant = 'default',
  addon,
  ...props
}: ComponentProps<'input'> & VariantProps<typeof inputVariants> & AddonConfig) {
  if (addon) {
    return (
      <div data-slot='input-group' role='group' className={cn(inputGroupVariants({ variant }))}>
        <InputPrimitive
          type={type}
          data-slot='input-group-control'
          className={cn(inputVariants({ variant }), inputGroupControlClassName, className)}
          {...props}
        />
        {addon}
      </div>
    );
  }

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
