'use client';

import { type ComponentProps } from 'react';

import { cn } from '@/app/lib/tailwind/utils';

import { Button } from './Button';

type GhostButtonGroupProps = ComponentProps<'div'>;

export function GhostIconButtonGroup({ className, children, ...props }: GhostButtonGroupProps) {
  return (
    <div
      data-slot='ghost-button-group'
      className={cn(
        'group/ghost-button-group inline-flex items-center gap-0.5 rounded-2xl border border-border',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

type GhostButtonGroupItemProps = Pick<
  ComponentProps<typeof Button>,
  'className' | 'onClick' | 'children'
>;

export function GhostIconButtonGroupItem({ className, ...props }: GhostButtonGroupItemProps) {
  return (
    <Button
      data-slot='ghost-button-group-item'
      variant='ghost'
      size='icon'
      className={cn('size-8.5', className)}
      {...props}
    />
  );
}
