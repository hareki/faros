import { createContext, use } from 'react';

import { type JobHuntSummary } from '@/app/features/job-hunt/types';

export type JobHuntContextValue = {
  /** The user's single active hunt, or `null` in the first-run shell. */
  activeJobHunt: JobHuntSummary | null;
  /**
   * The hunt currently in view — the active hunt, an ended hunt the user selected, or `null`
   * only when they have no hunts at all. Drives the switcher label and the hunt-scoped nav.
   */
  selectedJobHunt: JobHuntSummary | null;
  /** All of the user's hunts, active-first; consumers derive ended ones via `.filter`. */
  jobHunts: JobHuntSummary[];
};

export const JobHuntContext = createContext<JobHuntContextValue | null>(null);

/** Reads the active-hunt context; throws if used outside `<ActiveHuntProvider>`. */
export function useJobHuntContext() {
  const context = use(JobHuntContext);

  if (!context) {
    throw new Error('useJobHuntContext must be used within an JobHuntProvider.');
  }

  return context;
}
