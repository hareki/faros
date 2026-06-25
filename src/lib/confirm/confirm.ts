import { type ComponentProps, type ReactNode } from 'react';

import { create } from 'zustand';

import { type AlertDialogContent } from '@/src/components/ui/AlertDialog';

/** Visual variant of a confirm dialog; `destructive` renders a red action + media. */
export type ConfirmVariant = 'default' | 'destructive';

/** Config accepted by {@link confirm}; only `onConfirm` is required, the rest fall back to defaults. */
export type ConfirmConfig = {
  title?: ReactNode;
  /** Leading media icon. When omitted, no `AlertDialogMedia` is rendered (destructive defaults to a trash icon). */
  icon?: ReactNode;
  content?: ReactNode;
  /** Confirm button label. */
  confirmText?: string;
  /** Cancel button label. */
  cancelText?: string;
  /** Required. May return a promise; the dialog enters a loading state until it settles. */
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  size?: ComponentProps<typeof AlertDialogContent>['size'];
};

type ConfirmState = {
  open: boolean;
  config: (ConfirmConfig & { variant: ConfirmVariant }) | null;
};

/** Backing store for the mounted `ConfirmDialog` host; driven imperatively by {@link confirm}. */
export const useConfirmStore = create<ConfirmState>(() => ({
  open: false,
  config: null,
}));

function open(config: ConfirmConfig, variant: ConfirmVariant) {
  useConfirmStore.setState({ open: true, config: { ...config, variant } });
}

/** Headless imperative confirm dialog; `confirm.destructive` shares the same config with red styling. */
export const confirm = Object.assign(
  (config: ConfirmConfig) => {
    open(config, 'default');
  },
  {
    destructive: (config: ConfirmConfig) => {
      open(config, 'destructive');
    },
  },
);
