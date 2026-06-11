'use client';

import { useTheme } from '@teispace/next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

import { toastIcons } from '../icons';

export default function Toaster() {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      position='top-right'
      swipeDirections={['right']}
      className='group'
      duration={100_000}
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
