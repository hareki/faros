import * as React from 'react';

import { cn } from '@/app/lib/tailwind/utils';

type PolymorphicProps<T extends React.ElementType> = { as?: T } & Omit<
  React.ComponentPropsWithoutRef<T>,
  'as'
>;

function H1<T extends React.ElementType = 'h1'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'h1';

  return (
    <Comp
      data-slot='typography-h1'
      className={cn('scroll-m-20 text-4xl font-extrabold tracking-tight text-balance', className)}
      {...props}
    />
  );
}

function H2<T extends React.ElementType = 'h2'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'h2';

  return (
    <Comp
      data-slot='typography-h2'
      className={cn(
        `
          scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight
          first:mt-0
        `,
        className,
      )}
      {...props}
    />
  );
}

function H3<T extends React.ElementType = 'h3'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'h3';

  return (
    <Comp
      data-slot='typography-h3'
      className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function H4<T extends React.ElementType = 'h4'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'h4';

  return (
    <Comp
      data-slot='typography-h4'
      className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)}
      {...props}
    />
  );
}

function P<T extends React.ElementType = 'p'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'p';

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

function Blockquote<T extends React.ElementType = 'blockquote'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'blockquote';

  return (
    <Comp
      data-slot='typography-blockquote'
      className={cn('mt-6 border-l-2 pl-6 italic', className)}
      {...props}
    />
  );
}

function List<T extends React.ElementType = 'ul'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'ul';

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

function InlineCode<T extends React.ElementType = 'code'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'code';

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

function Lead<T extends React.ElementType = 'p'>({ as, className, ...props }: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'p';

  return (
    <Comp
      data-slot='typography-lead'
      className={cn('text-xl text-muted-foreground', className)}
      {...props}
    />
  );
}

function Large<T extends React.ElementType = 'div'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'div';

  return (
    <Comp
      data-slot='typography-large'
      className={cn('text-lg font-semibold', className)}
      {...props}
    />
  );
}

function Small<T extends React.ElementType = 'small'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'small';

  return (
    <Comp
      data-slot='typography-small'
      className={cn('text-sm leading-none font-medium', className)}
      {...props}
    />
  );
}

function Muted<T extends React.ElementType = 'p'>({
  as,
  className,
  ...props
}: PolymorphicProps<T>) {
  const Comp: React.ElementType = as ?? 'p';

  return (
    <Comp
      data-slot='typography-muted'
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export { H1, H2, H3, H4, P, Blockquote, List, InlineCode, Lead, Large, Small, Muted };
