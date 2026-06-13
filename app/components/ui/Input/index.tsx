import { type ComponentProps, type ReactNode } from 'react';

import { Input as InputPrimitive } from '@base-ui/react/input';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/lib/tailwind/utils';

import { inputVariants } from './variants';

function Input({
  className,
  type,
  variant = 'default',
  icon,
  ...props
}: ComponentProps<'input'> &
  VariantProps<typeof inputVariants> & {
    icon?: ReactNode;
  }) {
  const input = (
    <InputPrimitive
      type={type}
      data-slot='input'
      className={cn(inputVariants({ variant }), icon && 'pl-9', className)}
      {...props}
    />
  );

  if (!icon) {
    return input;
  }

  return (
    <div className='relative w-full'>
      {input}
      <span
        aria-hidden
        className={cn(`
          pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted-foreground
          [&_svg:not([class*='size-'])]:size-4
        `)}
      >
        {icon}
      </span>
    </div>
  );
}

export { Input };
