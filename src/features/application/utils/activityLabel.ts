import { type ActivityEntry } from '@/src/features/application/db/queries';
import { type BoardStage, type ClosedOutcome } from '@/src/features/application/types';
import { type ClientMessages } from '@/src/lib/next-intl/utils/clientMessages';

function interpolate(template: string, values: Record<string, string | undefined>): string {
  return template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? '');
}

/**
 * Maps an activity log entry to a localized one-line label using the raw ICU
 * strings from `ClientMessages['activity']`. Interpolates `{from}`/`{to}`/`{outcome}`
 * placeholders manually since these messages are passed as props, not via `useTranslations`.
 */
export function activityLabel(entry: ActivityEntry, messages: ClientMessages['activity']): string {
  switch (entry.type) {
    case 'stage_change': {
      const { from, to } = entry.metadata as { from: BoardStage; to: BoardStage };

      return interpolate(messages.stage_change, {
        from: messages.stages[from],
        to: messages.stages[to],
      });
    }

    case 'sub_stage_change': {
      const { to } = entry.metadata as { to: string | null };

      if (to === null) {
        return messages.sub_stage_cleared;
      }

      return interpolate(messages.sub_stage_change, { to });
    }

    case 'closed': {
      const { outcome } = entry.metadata as { outcome: ClosedOutcome };

      return interpolate(messages.closed, { outcome: messages.outcomes[outcome] });
    }

    case 'created':
    case 'note_added':
    case 'response_received':
    case 'offer_received':
    case 'event_scheduled':
    case 'event_completed':
    case 'event_cancelled':
    case 'resume_changed':
      return messages[entry.type];
    default:
      return '';
  }
}
