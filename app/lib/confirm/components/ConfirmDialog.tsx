'use client';

import { useState } from 'react';

import { useTranslations } from 'next-intl';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from '@/app/components/ui/AlertDialog';
import { useConfirmStore } from '@/app/lib/confirm/confirm';
import { cn } from '@/app/lib/tailwind/utils';

export function ConfirmDialog() {
  const open = useConfirmStore((state) => state.open);
  const config = useConfirmStore((state) => state.config);
  const [loading, setLoading] = useState(false);
  const t = useTranslations('components.confirmDialog');

  const destructive = config?.variant === 'destructive';
  const icon = config?.icon ?? null;
  const title = config?.title ?? t('title');
  const content = config?.content ?? t('content');
  const confirmText = config?.confirmText ?? t('confirmText');
  const cancelText = config?.cancelText ?? t('cancelText');
  const size = config?.size ?? 'default';

  const handleConfirm = async () => {
    if (!config) {
      return;
    }

    try {
      setLoading(true);
      await config.onConfirm();
      useConfirmStore.setState({ open: false });
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (next: boolean) => {
    if (next || loading) {
      return;
    }

    config?.onCancel?.();
    useConfirmStore.setState({ open: false });
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent size={size}>
        <AlertDialogHeader>
          {icon && (
            <AlertDialogMedia className={cn(destructive && 'bg-destructive/10 text-destructive')}>
              {icon}
            </AlertDialogMedia>
          )}
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{content}</AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            variant={destructive ? 'destructive' : 'default'}
            loading={loading}
            onClick={handleConfirm}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
