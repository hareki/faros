import localFont from 'next/font/local';

import { cn } from '@/lib/utils';

import type { Metadata } from 'next';

import './styles/globals.css';

// TODO: Remove unused fonts once I finalize the design
const rubik = localFont({
  src: [
    { path: './fonts/SVN-Rubik/SVN-Rubik-Light.woff2', weight: '300', style: 'normal' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-LightItalic.woff2', weight: '300', style: 'italic' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-RegularItalic.woff2', weight: '400', style: 'italic' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-MediumItalic.woff2', weight: '500', style: 'italic' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-SemiBold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-SemiBoldItalic.woff2', weight: '600', style: 'italic' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-BoldItalic.woff2', weight: '700', style: 'italic' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-ExtraBold.woff2', weight: '800', style: 'normal' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-ExtraBoldItalic.woff2', weight: '800', style: 'italic' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-Black.woff2', weight: '900', style: 'normal' },
    { path: './fonts/SVN-Rubik/SVN-Rubik-BlackItalic.woff2', weight: '900', style: 'italic' },
  ],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Faros',
  description: 'Job Application Tracker',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en' className={cn('h-full', 'antialiased', rubik.variable, 'font-sans')}>
      <body className='flex min-h-full flex-col'>{children}</body>
    </html>
  );
}
