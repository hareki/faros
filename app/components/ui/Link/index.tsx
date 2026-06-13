import { type ComponentProps } from 'react';

import { type VariantProps } from 'class-variance-authority';
import LinkPrimitive from 'next/link';

import { cn } from '@/app/lib/tailwind/utils';

import { linkVariants } from './variants';

export function Link({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ComponentProps<typeof LinkPrimitive> & VariantProps<typeof linkVariants>) {
  return <LinkPrimitive className={cn(linkVariants({ variant, size, className }))} {...props} />;
}
