import { type BoardStage } from '../types';

/**
 * Categorical accent per board stage, shared by the column header dot and the
 * card's sub-stage chip so the chip always matches its column. Closed reads
 * terminal/neutral.
 */
export const STAGE_COLOR: Record<BoardStage, { dot: string; subStageBadge: string }> = {
  applied: {
    dot: 'bg-chart-1',
    subStageBadge: 'border-chart-1/30 bg-chart-1/10 text-chart-1',
  },
  active: {
    dot: 'bg-chart-4',
    subStageBadge: 'border-chart-4/30 bg-chart-4/10 text-chart-4',
  },
  final_stages: {
    dot: 'bg-chart-2',
    subStageBadge: 'border-chart-2/30 bg-chart-2/10 text-chart-2',
  },
  closed: {
    dot: 'bg-muted-foreground',
    subStageBadge: 'border-muted-foreground/30 bg-muted-foreground/10 text-muted-foreground',
  },
};
