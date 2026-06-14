import { H2 } from '@/app/components/ui/Typography';

// Available for both the active hunt and a selected ended hunt. When the selected hunt is
// ended the board renders read-only (a frozen history view) — wired up with the real board.
export default function TrackerBoard() {
  return (
    <div>
      <H2>Tracker Board</H2>
    </div>
  );
}
