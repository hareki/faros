import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/src/components/ui/AlertDialog';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

type StartBlockedDialogViewProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Hands off to the End-hunt flow so the user can clear the active hunt first. */
  onEndCurrent: () => void;
  messages: ClientMessages['layout']['jobHuntDialogs']['startBlocked'];
};

/**
 * Shown when the user picks "Start a hunt" while one is already active. Rather than opening the
 * start form (which the server would reject), it explains the one-active-hunt rule and offers a
 * direct path to end the current hunt.
 */
export function StartBlockedDialogView({
  open,
  onOpenChange,
  onEndCurrent,
  messages,
}: StartBlockedDialogViewProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{messages.title}</AlertDialogTitle>
          <AlertDialogDescription>{messages.description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{messages.cancel}</AlertDialogCancel>
          <AlertDialogAction onClick={onEndCurrent}>{messages.endCurrent}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
