import { type ReactNode } from 'react';

import { toast as sonnerToast } from 'sonner';

import { Toast, type ToastAction, type ToastType } from './components/Toast';

type ToastOptions = {
  description?: ReactNode;
  action?: ToastAction;
  closeLabel?: string;
};

function emit(type: ToastType, title: ReactNode, options?: ToastOptions) {
  return sonnerToast.custom((id) => (
    <Toast
      id={id}
      type={type}
      title={title}
      description={options?.description}
      action={options?.action}
      closeLabel={options?.closeLabel}
    />
  ));
}

/** Headless toast wrapping `sonner` with our card UI; drop-in for `sonner`'s `toast`. */
export const toast = Object.assign(
  (title: ReactNode, options?: ToastOptions) => emit('default', title, options),
  {
    success: (title: ReactNode, options?: ToastOptions) => emit('success', title, options),
    info: (title: ReactNode, options?: ToastOptions) => emit('info', title, options),
    warning: (title: ReactNode, options?: ToastOptions) => emit('warning', title, options),
    error: (title: ReactNode, options?: ToastOptions) => emit('error', title, options),
    loading: (title: ReactNode, options?: ToastOptions) => emit('loading', title, options),
    dismiss: sonnerToast.dismiss,
  },
);
