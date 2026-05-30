import { type ComponentProps } from 'react';

import type Link from 'next/link';

export type NextRoute = ComponentProps<typeof Link>['href'];
export type ActionResult<TErrorKey> =
  | { status: 'success' }
  | { status: 'error'; errorKey: TErrorKey };
