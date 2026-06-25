import { type UrlObject } from 'url';

import { type ComponentProps } from 'react';

import { type VariantProps } from 'class-variance-authority';
import LinkPrimitive from 'next/link';

import { cn } from '@/src/lib/tailwind/utils';

import { linkVariants } from './variants';

export type Routes = Exclude<ComponentProps<typeof LinkPrimitive>['href'], UrlObject>;

export function Link({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: ComponentProps<typeof LinkPrimitive> & VariantProps<typeof linkVariants>) {
  return <LinkPrimitive className={cn(linkVariants({ variant, size, className }))} {...props} />;
}
