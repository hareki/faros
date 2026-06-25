/** Minimal client-facing shape of a job_hunt for the switcher / active-hunt context. */
export type JobHuntSummary = { id: string; name: string; status: 'active' | 'ended' };
