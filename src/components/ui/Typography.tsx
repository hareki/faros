import { type ComponentPropsWithoutRef, type ElementType } from 'react';

import { cn } from '@/src/lib/tailwind/utils';

type PolymorphicProps<T extends ElementType> = { as?: T } & Omit<ComponentPropsWithoutRef<T>, 'as'>;

function H1<T extends ElementType = 'h1'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'h1';

  return (
    <Comp
      data-slot='typography-h1'
      className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight text-balance', className)}
      {...props}
    />
  );
}

function H2<T extends ElementType = 'h2'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'h2';

  return (
    <Comp
      data-slot='typography-h2'
      className={cn(
        `
          scroll-m-20 pb-2 text-3xl font-semibold tracking-tight
          first:mt-0
        `,
        className,
      )}
      {...props}
    />
  );
}

function H3<T extends ElementType = 'h3'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'h3';

  return (
    <Comp
      data-slot='typography-h3'
      className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function H4<T extends ElementType = 'h4'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'h4';

  return (
    <Comp
      data-slot='typography-h4'
      className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function P<T extends ElementType = 'p'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'p';

  return (
    <Comp
      data-slot='typography-p'
      className={cn(
        `
          leading-6
          not-first:mt-6
        `,
        className,
      )}
      {...props}
    />
  );
}

function Blockquote<T extends ElementType = 'blockquote'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'blockquote';

  return (
    <Comp
      data-slot='typography-blockquote'
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    />
  );
}

function List<T extends ElementType = 'ul'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'ul';

  return (
    <Comp
      data-slot='typography-list'
      className={cn(
        `
          my-6 ml-6 list-disc
          [&>li]:mt-2
        `,
        className,
      )}
      {...props}
    />
  );
}

function InlineCode<T extends ElementType = 'code'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'code';

  return (
    <Comp
      data-slot='typography-inline-code'
      className={cn(
        'relative rounded-sm bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
        className,
      )}
      {...props}
    />
  );
}

function Lead<T extends ElementType = 'p'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'p';

  return (
    <Comp
      data-slot='typography-lead'
      className={cn('text-xl text-muted-foreground', className)}
      {...props}
    />
  );
}

function Large<T extends ElementType = 'div'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'div';

  return (
    <Comp
      data-slot='typography-large'
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

function Text<T extends ElementType = 'span'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'span';

  return (
    <Comp
      data-slot='typography-text'
      className={cn('text-base leading-none font-medium', className)}
      {...props}
    />
  );
}

function Small<T extends ElementType = 'small'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'small';

  return (
    <Comp
      data-slot='typography-small'
      className={cn('text-sm leading-none font-medium', className)}
      {...props}
    />
  );
}

function Muted<T extends ElementType = 'span'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: ElementType = as ?? 'span';

  return (
    <Comp
      data-slot='typography-muted'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { H1, H2, H3, H4, P, Blockquote, List, InlineCode, Lead, Large, Text, Small, Muted };
