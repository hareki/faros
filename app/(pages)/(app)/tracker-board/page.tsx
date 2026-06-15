import { type Metadata } from 'next';
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('metadata');

  return { title: t('trackerBoard') };
}

// Available for both the active hunt and a selected ended hunt. When the selected hunt is
// ended the board renders read-only (a frozen history view) — wired up with the real board.
export default function TrackerBoard() {
  return null;
}
