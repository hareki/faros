// Static dummy data for the Job Hunt switcher / first-run sketch (todos.md L73).
// Replaced by `<ActiveHuntProvider>` + real queries when the feature is wired (L76-78).

export type SketchJobHunt = { id: string; name: string; status: 'active' | 'ended' };

// Flip to preview the first-run (no active hunt) shell state in the static sketch.
const SKETCH_FIRST_RUN = false;

export const sketchJobHunts: SketchJobHunt[] = SKETCH_FIRST_RUN
  ? []
  : [
      { id: '1', name: '2026 Senior FE Hunt', status: 'active' },
      { id: '2', name: '2024 New Grad Hunt', status: 'ended' },
    ];

export const activeSketchJobHunt =
  sketchJobHunts.find((jobHunt) => jobHunt.status === 'active') ?? null;

export const endedSketchJobHunts = sketchJobHunts.filter((jobHunt) => jobHunt.status === 'ended');
