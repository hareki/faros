'use client';

import { type ReactNode } from 'react';

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
};

/** Headless toast card built from our `Typography` and `Button`, themed per {@link ToastType}. */
export function Toast({ id, type = 'default', title, description, action }: ToastProps) {
  const icon = type === 'default' ? null : toastIcons[type];

  return (
    <div
      className={`
        flex w-full items-center gap-3 rounded-lg border bg-popover p-4 text-popover-foreground
        shadow-lg
      `}
    >
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
