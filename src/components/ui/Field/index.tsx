'use client';

import { type ComponentProps, type ReactNode, useEffect, useMemo, useState } from 'react';

import { type VariantProps } from 'class-variance-authority';

import { Label } from '@/src/components/ui/Label';
import { Separator } from '@/src/components/ui/Separator';
import { cn } from '@/src/lib/tailwind/utils';

import { fieldVariants } from './variants';

function FieldSet({ className, ...props }: ComponentProps<'fieldset'>) {
  return (
    <fieldset
      data-slot='field-set'
      className={cn(
        `
          flex flex-col gap-6
          has-[>[data-slot=checkbox-group]]:gap-3
          has-[>[data-slot=radio-group]]:gap-3
        `,
        className,
      )}
      {...props}
    />
  );
}

function FieldLegend({
  className,
  variant = 'legend',
  ...props
}: ComponentProps<'legend'> & { variant?: 'legend' | 'label' }) {
  return (
    <legend
      data-slot='field-legend'
      data-variant={variant}
      className={cn(
        `
          mb-3 font-medium
          data-[variant=label]:text-sm
          data-[variant=legend]:text-base
        `,
        className,
      )}
      {...props}
    />
  );
}

function FieldGroup({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-group'
      className={cn(
        `
          group/field-group @container/field-group flex w-full flex-col gap-7
          data-[slot=checkbox-group]:gap-3
          *:data-[slot=field-group]:gap-4
        `,
        className,
      )}
      {...props}
    />
  );
}

function Field({
  className,
  orientation = 'vertical',
  ...props
}: ComponentProps<'div'> & VariantProps<typeof fieldVariants>) {
  return (
    <div
      role='group'
      data-slot='field'
      data-orientation={orientation}
      className={cn(fieldVariants({ orientation }), className)}
      {...props}
    />
  );
}

function FieldContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-content'
      className={cn('group/field-content flex flex-1 flex-col gap-1 leading-snug', className)}
      {...props}
    />
  );
}

function FieldLabel({ className, ...props }: ComponentProps<typeof Label>) {
  return (
    <Label
      data-slot='field-label'
      className={cn(
        `
          group/field-label peer/field-label flex w-fit gap-2 leading-snug
          group-data-[disabled=true]/field:opacity-50
          has-data-checked:bg-input/30
          has-[>[data-slot=field]]:rounded-2xl has-[>[data-slot=field]]:border
          *:data-[slot=field]:p-4
        `,
        'has-[>[data-slot=field]]:w-full has-[>[data-slot=field]]:flex-col',
        className,
      )}
      {...props}
    />
  );
}

function FieldTitle({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      data-slot='field-label'
      className={cn(
        `
          flex w-fit items-center gap-2 text-sm font-medium
          group-data-[disabled=true]/field:opacity-50
        `,
        className,
      )}
      {...props}
    />
  );
}

function FieldDescription({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      data-slot='field-description'
      className={cn(
        `
          text-left text-sm/normal font-normal text-muted-foreground
          group-has-data-horizontal/field:text-balance
          [[data-variant=legend]+&]:-mt-1.5
        `,
        `
          last:mt-0
          nth-last-2:-mt-1
        `,
        className,
      )}
      {...props}
    />
  );
}

function FieldSeparator({
  children,
  className,
  ...props
}: ComponentProps<'div'> & {
  children?: ReactNode;
}) {
  return (
    <div
      data-slot='field-separator'
      data-content={!!children}
      className={cn(
        `
          relative -my-2 h-5 text-sm
          group-data-[variant=outline]/field-group:-mb-2
        `,
        className,
      )}
      {...props}
    >
      <Separator className='absolute inset-0 top-1/2' />
      {children && (
        <span
          className='relative mx-auto block w-fit bg-background px-2 text-muted-foreground'
          data-slot='field-separator-content'
        >
          {children}
        </span>
      )}
    </div>
  );
}

function FieldError({
  className,
  children,
  errors,
  ...props
}: ComponentProps<'div'> & {
  errors?: ({ message?: string } | undefined)[];
}) {
  const content = useMemo(() => {
    if (children) {
      return children;
    }

    if (!errors?.length) {
      return null;
    }

    const uniqueErrors = [...new Map(errors.map((error) => [error?.message, error])).values()];

    if (uniqueErrors.length == 1) {
      return uniqueErrors[0]?.message;
    }

    return (
      <ul className='ml-4 flex list-disc flex-col gap-1'>
        {uniqueErrors.map((error, index) => error?.message && <li key={index}>{error.message}</li>)}
      </ul>
    );
  }, [children, errors]);

  // Keep the last non-empty content rendered while collapsing so the exit
  // animation has something to show.
  const [renderedContent, setRenderedContent] = useState(content);
  const [mounted, setMounted] = useState(!!content);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!content) {
      return;
    }

    // Defer to the next frame so the wrapper mounts in its collapsed state
    // before `open` flips — that two-step is what kicks off the enter transition.
    const frame = requestAnimationFrame(() => {
      setRenderedContent(content);
      setMounted(true);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [content]);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    // The collapse transition (and its transitionend) never fires under
    // reduced motion, so unmount immediately when the error clears.
    if (!content && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const frame = requestAnimationFrame(() => {
        setMounted(false);
      });

      return () => {
        cancelAnimationFrame(frame);
      };
    }

    const frame = requestAnimationFrame(() => {
      setOpen(!!content);
    });

    return () => {
      cancelAnimationFrame(frame);
    };
  }, [mounted, content]);

  if (!mounted) {
    return null;
  }

  return (
    <div
      data-slot='field-error-wrapper'
      data-state={open ? 'open' : 'closed'}
      className={cn(`
        -mt-3 grid grid-rows-[0fr] opacity-0 transition-[grid-template-rows,opacity,margin-top]
        duration-200 ease-out
        data-[state=open]:mt-0 data-[state=open]:grid-rows-[1fr] data-[state=open]:opacity-100
        motion-reduce:transition-none
      `)}
      onTransitionEnd={(event) => {
        if (
          event.target === event.currentTarget &&
          event.propertyName === 'grid-template-rows' &&
          !open
        ) {
          setMounted(false);
        }
      }}
    >
      <div className='overflow-hidden'>
        <div
          role='alert'
          data-slot='field-error'
          className={cn('text-sm font-normal text-destructive', className)}
          {...props}
        >
          {renderedContent}
        </div>
      </div>
    </div>
  );
}

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
