import { createLoader, parseAsArrayOf, parseAsString, parseAsStringLiteral } from 'nuqs/server';

import { APPLICATION_SOURCES, WORKING_MODELS } from '@/src/features/application/types';

/** URL <=> board-filter state. Shared by the filter bar (client) and the board page (server). */
export const boardFilterParsers = {
  tags: parseAsArrayOf(parseAsString).withDefault([]),
  subStage: parseAsString,
  source: parseAsStringLiteral(APPLICATION_SOURCES),
  workingModel: parseAsStringLiteral(WORKING_MODELS),
};

/** Parses the board filters out of a Next.js `searchParams` object (server-side). */
export const loadBoardFilters = createLoader(boardFilterParsers);
