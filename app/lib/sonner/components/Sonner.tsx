'use client';

import { useTheme } from '@teispace/next-themes';
import { Toaster, type ToasterProps } from 'sonner';

import { toastIcons } from '../icons';

export function Sonner() {
  const { theme } = useTheme();

  return (
    <Toaster
      theme={theme as ToasterProps['theme']}
      position='top-right'
      swipeDirections={['right']}
      className='group'
      icons={toastIcons}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--border)',
          '--border-radius': 'var(--radius)',
        } as React.CSSProperties
      }
    />
  );
}
