'use client';

import { type PropsWithChildren } from 'react';

import { ActiveHuntContext } from '@/app/features/job-hunt/hooks/useActiveJobHunt';
import { type JobHuntSummary } from '@/app/features/job-hunt/types';

type ActiveHuntProviderProps = PropsWithChildren<{
  jobHunts: JobHuntSummary[];
  activeJobHunt: JobHuntSummary | null;
}>;

/**
 * Distributes the server-fetched hunts to client components in the app shell. Read-only:
 * the server layout is the source of truth, and lifecycle mutations re-sync via
 * `router.refresh()`.
 */
export function ActiveHuntProvider({ jobHunts, activeJobHunt, children }: ActiveHuntProviderProps) {
  return <ActiveHuntContext value={{ activeJobHunt, jobHunts }}>{children}</ActiveHuntContext>;
}
