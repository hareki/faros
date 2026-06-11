'use client'; // Error boundaries must be Client Components

import { type ErrorInfo } from 'next/error';

import { RouteErrorFallback } from '@/app/components/layout/RouteErrorFallback';

export default function AppError(props: ErrorInfo) {
  return <RouteErrorFallback {...props} scope='app' />;
}
