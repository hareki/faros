import { type ComponentProps } from 'react';

import { type Messages } from 'next-intl';

import type Link from 'next/link';

export type NextRoute = ComponentProps<typeof Link>['href'];

export type GlobalErrorKey = Extract<
  keyof Messages['validation'],
  'errorGeneric' | 'errorValidation'
>;

export type ActionResult<TErrorKey> =
  | { status: 'success' }
  | { status: 'error'; errorKey: TErrorKey | GlobalErrorKey };
