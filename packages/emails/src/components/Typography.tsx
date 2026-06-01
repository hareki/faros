import { type ComponentProps } from 'react';

import { Heading as HeadingPrimitive, Text as TextPrimitive } from 'react-email';

import { cn } from '../utils';

// Mimics app/components/ui/Typography.tsx, reusing its class vocabulary minus the bits
// email can't render (scroll-m-20, border-b, text-balance, first:/not-first: pseudos).
// All default to text-foreground.

type HeadingLevel = 1 | 2 | 3 | 4;

const headingClasses: Record<HeadingLevel, string> = {
  1: 'text-4xl font-extrabold tracking-tight',
  2: 'text-3xl font-semibold tracking-tight',
  3: 'text-2xl font-semibold tracking-tight',
  4: 'text-xl font-semibold tracking-tight',
};

const headingTags = { 1: 'h1', 2: 'h2', 3: 'h3', 4: 'h4' } as const;

export function Heading({
  level = 2,
  className,
  ...props
}: ComponentProps<typeof HeadingPrimitive> & { level?: HeadingLevel }) {
  return (
    <HeadingPrimitive
      as={headingTags[level]}
      className={cn(headingClasses[level], 'm-0 text-foreground', className)}
      {...props}
    />
  );
}

// Mimics typography `P`.
export function Text({ className, ...props }: ComponentProps<typeof TextPrimitive>) {
  return <TextPrimitive className={cn('m-0 leading-6 text-foreground', className)} {...props} />;
}

// Mimics typography `Muted`.
export function Muted({ className, ...props }: ComponentProps<typeof TextPrimitive>) {
  return (
    <TextPrimitive className={cn('m-0 text-sm text-muted-foreground', className)} {...props} />
  );
}

// Mimics typography `Small`.
export function Small({ className, ...props }: ComponentProps<typeof TextPrimitive>) {
  return (
    <TextPrimitive className={cn('text-sm font-medium text-foreground', className)} {...props} />
  );
}

// Mimics typography `Lead`.
export function Lead({ className, ...props }: ComponentProps<typeof TextPrimitive>) {
  return (
    <TextPrimitive className={cn('m-0 text-xl text-muted-foreground', className)} {...props} />
  );
}

// Mimics typography `Large`.
export function Large({ className, ...props }: ComponentProps<typeof TextPrimitive>) {
  return (
    <TextPrimitive
      className={cn('m-0 text-lg font-semibold text-foreground', className)}
      {...props}
    />
  );
}
