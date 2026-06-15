'use client';

import { usePathname } from 'next/navigation';

import { type Routes } from '../../ui/Link';
import { H3 } from '../../ui/Typography';

type PageTitleProps = {
  titles: Partial<Record<Routes, string>>;
};

export function PageTitle({ titles }: PageTitleProps) {
  const pathname = usePathname();
  const title = titles[pathname as Routes];

  if (!title) {
    return null;
  }

  return <H3 as='h1'>{title}</H3>;
}
