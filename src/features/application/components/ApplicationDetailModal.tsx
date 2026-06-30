'use client';

import { type PropsWithChildren } from 'react';

import { useRouter } from 'next/navigation';

import { Dialog, DialogContent } from '@/src/components/ui/Dialog';

/**
 * Client host for the intercepted detail route: a controlled Dialog that opens on mount and,
 * when dismissed (close button / Escape / overlay), navigates back to the board via
 * `router.back()` so the URL returns to `/tracker-board` and the modal slot resets to default.
 */
export function ApplicationDetailModal({ children }: PropsWithChildren) {
  const router = useRouter();

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) {
          router.back();
        }
      }}
    >
      <DialogContent className='max-h-[85vh] w-full max-w-3xl overflow-y-auto'>
        {children}
      </DialogContent>
    </Dialog>
  );
}
