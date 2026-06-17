import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

import { MOCK_BOARD_APPLICATIONS } from '@/app/features/application/utils/mockBoard';
import { TrackerBoardView } from '@/app/features/application/views/TrackerBoardView';
import { getClientMessages } from '@/app/lib/next-intl/utils/getClientMessages';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('trackerBoard') };
}

// Available for both the active hunt and a selected ended hunt. When the selected hunt is
// ended the board renders read-only (a frozen history view) — wired up with the real board.
export default async function TrackerBoard() {
  const messages = await getClientMessages();

  return (
    <TrackerBoardView messages={messages.trackerBoard} applications={MOCK_BOARD_APPLICATIONS} />
  );
}
