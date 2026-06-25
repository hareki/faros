'use client';

import { type ComponentProps } from 'react';

import { cn } from '@/src/lib/tailwind/utils';

import { Button } from './Button';

type GhostButtonGroupProps = ComponentProps<'div'>;

export function GhostButtonGroup({ className, children, ...props }: GhostButtonGroupProps) {
  return (
    <div
      data-slot='ghost-button-group'
      className={cn(
        `
          group/ghost-button-group inline-flex items-center gap-1 rounded-full border border-border
          p-0.5
        `,
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
  'className' | 'onClick' | 'children' | 'tooltip'
> & {
  variant?: 'default' | 'destructive';
  shape?: 'pill' | 'circle';
};

export function GhostButtonGroupItem({
  className,
  variant = 'default',
  shape = 'circle',
  ...props
}: GhostButtonGroupItemProps) {
  return (
    <Button
      data-slot='ghost-button-group-item'
      variant='ghost'
      size={shape === 'pill' ? 'default' : 'icon'}
      className={cn(
        shape === 'pill' && 'h-[calc(var(--spacing-input-height)-(--spacing(1.5)))]',
        shape === 'circle' && 'size-[calc(var(--spacing-input-height)-(--spacing(1.5)))]',
        variant === 'destructive' &&
          `
            hover:bg-destructive/10 hover:text-destructive
            focus-visible:border-destructive/40 focus-visible:ring-destructive/20
            dark:hover:bg-destructive/10
          `,
        className,
      )}
      {...props}
    />
  );
}
