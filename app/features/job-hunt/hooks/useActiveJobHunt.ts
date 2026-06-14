import { createContext, use } from 'react';

import { type JobHuntSummary } from '@/app/features/job-hunt/types';

export type ActiveHuntContextValue = {
  /** The user's single active hunt, or `null` in the first-run shell. */
  activeJobHunt: JobHuntSummary | null;
  /** All of the user's hunts, active-first; consumers derive ended ones via `.filter`. */
  jobHunts: JobHuntSummary[];
};

export const ActiveHuntContext = createContext<ActiveHuntContextValue | null>(null);

/** Reads the active-hunt context; throws if used outside `<ActiveHuntProvider>`. */
export function useActiveJobHunt() {
  const context = use(ActiveHuntContext);

  if (!context) {
    throw new Error('useActiveJobHunt must be used within an ActiveHuntProvider.');
  }

  return context;
}
