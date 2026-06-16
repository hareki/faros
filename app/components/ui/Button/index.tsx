import { Button as ButtonPrimitive } from '@base-ui/react/button';
import { type VariantProps } from 'class-variance-authority';

import { cn } from '@/app/lib/tailwind/utils';

import { buttonVariants } from './variants';
import { Spinner } from '../Spinner';
import { TooltipContent, Tooltip, TooltipTrigger } from '../Tooltip';
import { P } from '../Typography';

function Button({
  className,
  variant = 'default',
  size = 'default',
  loading,
  children,
  disabled,
  tooltip,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & { loading?: boolean; tooltip?: string }) {
  const button = (
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

  if (!tooltip) {
    return button;
  }

  return (
    <Tooltip>
      <TooltipTrigger render={button} />
      <TooltipContent>
        <P>{tooltip}</P>
      </TooltipContent>
    </Tooltip>
  );
}

export { Button };
