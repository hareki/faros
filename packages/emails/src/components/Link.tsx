import { type ComponentProps } from 'react';

import { Link as LinkPrimitive } from 'react-email';

import { cn } from '../utils';

// Mimics app/components/ui/Link/variants.ts. The app's `hover:text-primary` collapses
// to a static color for email (no hover state).

type LinkVariant = 'default' | 'action';
type LinkSize = 'default' | 'sm';

const base = 'transition-colors';

const variantClasses: Record<LinkVariant, string> = {
  default: 'text-primary underline underline-offset-3',
  action: 'font-semibold text-foreground no-underline',
};

const sizeClasses: Record<LinkSize, string> = {
  default: 'text-sm',
  sm: 'text-xs',
};

export function Link({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: ComponentProps<typeof LinkPrimitive> & {
  variant?: LinkVariant;
  size?: LinkSize;
}) {
  return (
    <LinkPrimitive
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}
