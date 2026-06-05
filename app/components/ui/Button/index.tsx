import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/lib/tailwind/utils';

import { buttonVariants } from './variants';
import { Spinner } from '../Spinner';

export default function Button({
  className,
  variant = 'default',
  size = 'default',
  loading,
  children,
  disabled,
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants> & { loading?: boolean }) {
  return (
    <ButtonPrimitive
      data-slot='button'
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={disabled || loading}
      {...props}
    >
      <span className='flex items-center gap-2'>
        {children}
        {loading && <Spinner data-icon='inline-start' />}
      </span>
    </ButtonPrimitive>
  );
}
