'use client';

import { type KeyboardEvent, type MouseEvent, type ComponentProps } from 'react';

import { cva, type VariantProps } from 'class-variance-authority';

import { Button } from '@/app/components/ui/Button';
import { Input } from '@/app/components/ui/Input';
import { cn } from '@/app/lib/tailwind/utils';

import { Textarea } from '../Textarea';
import { inputGroupVariants } from './variants';

function InputGroup({
  className,
  variant,
  ...props
}: ComponentProps<'div'> & VariantProps<typeof inputGroupVariants>) {
  return (
    <div
      data-slot='input-group'
      role='group'
      className={cn(inputGroupVariants({ variant }), className)}
      {...props}
    />
  );
}

const inputGroupAddonVariants = cva(
  `
    flex-center h-auto cursor-text gap-2 py-2 text-sm font-medium text-muted-foreground select-none
    group-data-[disabled=true]/input-group:opacity-50
    **:data-[slot=kbd]:rounded-3xl **:data-[slot=kbd]:bg-muted-foreground/10
    **:data-[slot=kbd]:px-1.5
    [&>svg:not([class*='size-'])]:size-4
  `,
  {
    variants: {
      align: {
        'inline-start': `
          order-first pl-3
          has-[>button]:-ml-1
          has-[>kbd]:-ml-1
        `,
        'inline-end': `
          order-last pr-3
          has-[>button]:-mr-1
          has-[>kbd]:-mr-1
        `,
        'block-start': `
          order-first w-full justify-start px-3 pt-3
          group-has-[>input]/input-group:pt-3.5
          [.border-b]:pb-3.5
        `,
        'block-end': `
          order-last w-full justify-start px-3 pb-3
          group-has-[>input]/input-group:pb-3.5
          [.border-t]:pt-3.5
        `,
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

function InputGroupAddon({
  className,
  align = 'inline-start',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof inputGroupAddonVariants>) {
  const handleFocus = (e: MouseEvent<HTMLDivElement> | KeyboardEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }

    e.currentTarget.parentElement?.querySelector('input')?.focus();
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      role='group'
      data-slot='input-group-addon'
      data-align={align}
      className={cn(inputGroupAddonVariants({ align }), className)}
      onKeyDown={handleFocus}
      onClick={handleFocus}
      {...props}
    />
  );
}

const inputGroupButtonVariants = cva('flex items-center gap-2 rounded-4xl text-sm shadow-none', {
  variants: {
    size: {
      xs: `
        h-6 gap-1 rounded-xl px-1.5
        [&>svg:not([class*='size-'])]:size-3.5
      `,
      sm: '',
      'icon-xs': `
        size-6 rounded-xl p-0
        has-[>svg]:p-0
      `,
      'icon-sm': `
        size-8 p-0
        has-[>svg]:p-0
      `,
    },
  },
  defaultVariants: {
    size: 'xs',
  },
});

function InputGroupButton({
  className,
  type = 'button',
  variant = 'ghost',
  size = 'xs',
  ...props
}: Omit<ComponentProps<typeof Button>, 'size' | 'type'> &
  VariantProps<typeof inputGroupButtonVariants> & {
    type?: 'button' | 'submit' | 'reset';
  }) {
  return (
    <Button
      type={type}
      data-size={size}
      variant={variant}
      className={cn(inputGroupButtonVariants({ size }), className)}
      {...props}
    />
  );
}

function InputGroupText({ className, ...props }: ComponentProps<'span'>) {
  return (
    <span
      className={cn(
        `
          flex items-center gap-2 text-sm text-muted-foreground
          [&_svg]:pointer-events-none
          [&_svg:not([class*='size-'])]:size-4
        `,
        className,
      )}
      {...props}
    />
  );
}

function InputGroupInput({ className, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot='input-group-control'
      className={cn(
        `
          flex-1 rounded-none border-0 bg-transparent shadow-none ring-0
          focus-visible:ring-0
          aria-invalid:ring-0
          dark:bg-transparent
        `,
        className,
      )}
      {...props}
    />
  );
}

function InputGroupTextarea({ className, ...props }: ComponentProps<'textarea'>) {
  return (
    <Textarea
      data-slot='input-group-control'
      className={cn(
        `
          flex-1 resize-none rounded-none border-0 bg-transparent py-2.5 shadow-none ring-0
          focus-visible:ring-0
          aria-invalid:ring-0
          dark:bg-transparent
        `,
        className,
      )}
      {...props}
    />
  );
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
