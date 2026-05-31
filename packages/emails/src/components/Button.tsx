import { type ComponentProps } from 'react';

import { Button as ButtonPrimitive } from 'react-email';

import { cn } from '../utils';

// Mimics app/components/ui/Button/variants.ts, filtered to email-safe styles
// (no hover/focus/dark/aria/svg). Height-based app sizes become padding for email.

type ButtonVariant = 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
type ButtonSize = 'default' | 'sm' | 'lg';

const base = 'box-border inline-block rounded-4xl text-center text-sm font-medium no-underline';

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  outline: 'border border-solid border-border bg-background text-foreground',
  ghost: 'text-foreground',
  destructive: 'bg-destructive/10 text-destructive',
};

const sizeClasses: Record<ButtonSize, string> = {
  default: 'px-3 py-2.5',
  sm: 'px-3 py-2',
  lg: 'px-4 py-3',
};

export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ComponentProps<typeof ButtonPrimitive> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return (
    <ButtonPrimitive
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}
