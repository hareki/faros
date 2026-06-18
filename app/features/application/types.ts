// Type-only imports of the Drizzle enums are erased at build, so the board's display
// types stay in sync with the schema without pulling drizzle into the client bundle.
import type { applicationSource, boardStage } from './db/schema';

export type BoardStage = (typeof boardStage.enumValues)[number];
export type ApplicationSource = (typeof applicationSource.enumValues)[number];

/** The four board columns, in display order (mirrors the `board_stage` enum). */
export const BOARD_STAGES = [
  'applied',
  'active',
  'final_stages',
  'closed',
] as const satisfies readonly BoardStage[];

export type BoardSubStage = { id: string; name: string };
export type BoardTag = { id: string; name: string; color: string | null };

/**
 * Everything a board card needs to render. The card currently paints only company +
 * role; the rest (sub-stage chip, tag chips, source icon) is fleshed out in the card todo.
 */
export type BoardApplication = {
  id: string;
  company: string;
  role: string;
  stage: BoardStage;
  subStage: BoardSubStage | null;
  tags: BoardTag[];
  source: ApplicationSource | null;
  favorite: boolean;
  appliedAt: Date;
};
