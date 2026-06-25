'use client';

import { type ComponentProps } from 'react';

import { cn } from '@/src/lib/tailwind/utils';

type LabelProps = ComponentProps<'label'>;

function Label({
  className,
  ...props
}: LabelProps & { htmlFor: NonNullable<LabelProps['htmlFor']> }) {
  return (
    // Already requiring htmlFor to be passed in
    // eslint-disable-next-line jsx-a11y/label-has-associated-control
    <label
      data-slot='label'
      className={cn(
        `
          flex items-center gap-2 text-sm leading-none font-medium select-none
          group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50
          peer-disabled:cursor-not-allowed peer-disabled:opacity-50
        `,
        className,
      )}
      {...props}
    />
  );
}

export { Label };
