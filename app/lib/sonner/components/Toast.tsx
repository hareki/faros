'use client';

import { type ReactNode } from 'react';

import { IconX } from '@tabler/icons-react';
import { toast as sonnerToast } from 'sonner';

import { Button } from '@/app/components/ui/Button';
import { Muted, Small } from '@/app/components/ui/Typography';

import { toastIcons } from '../icons';

/** Visual variant of a toast; `default` renders no leading icon. */
export type ToastType = 'default' | 'success' | 'info' | 'warning' | 'error' | 'loading';

/** Optional action button rendered on the trailing edge of a toast. */
export type ToastAction = {
  label: string;
  onClick: () => void;
};

/** Props for the headless {@link Toast} card. */
export type ToastProps = {
  id: string | number;
  type?: ToastType;
  title: ReactNode;
  description?: ReactNode;
  action?: ToastAction;
  /** Accessible label for the corner close button. Defaults to `'Close'`. */
  closeLabel?: string;
};

/** Headless toast card built from our `Typography` and `Button`, themed per {@link ToastType}. */
export function Toast({
  id,
  type = 'default',
  title,
  description,
  action,
  closeLabel = 'Close',
}: ToastProps) {
  const icon = type === 'default' ? null : toastIcons[type];

  return (
    <div
      className={`
        group relative flex w-full items-center gap-3 rounded-lg border bg-popover p-4
        text-popover-foreground shadow-lg
      `}
    >
      <Button
        type='button'
        variant='secondary'
        size='icon-xs'
        aria-label={closeLabel}
        onClick={() => sonnerToast.dismiss(id)}
        className={`
          absolute -top-2.5 -left-2.5 rounded-full opacity-0 shadow-sm transition-opacity
          group-hover:opacity-100 group-focus-within:opacity-100
          focus-visible:opacity-100
        `}
      >
        <IconX />
      </Button>
      {icon && <span className='shrink-0'>{icon}</span>}
      <div className='flex-1'>
        <Small as='p'>{title}</Small>
        {description && <Muted className='mt-1'>{description}</Muted>}
      </div>
      {action && (
        <Button
          variant='secondary'
          size='sm'
          className='shrink-0'
          onClick={() => {
            action.onClick();
            sonnerToast.dismiss(id);
          }}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
