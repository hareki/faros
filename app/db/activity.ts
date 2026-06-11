import 'server-only';

import { and, eq } from 'drizzle-orm';

import { type DbExecutor } from '@/app/db/client';
import { activityLog } from '@/app/db/schema/activity';
import { type boardStage, type closedOutcome } from '@/app/db/schema/application';
import { type eventType } from '@/app/db/schema/event';

type BoardStage = (typeof boardStage.enumValues)[number];
type ClosedOutcome = (typeof closedOutcome.enumValues)[number];
type EventType = (typeof eventType.enumValues)[number];

// Why an application first showed a response / received an offer. Lets analytics and
// debugging tell an auto-derived milestone from a manually logged one.
type ResponseTrigger = 'stage_advance' | 'closed_rejected' | 'manual';
type OfferTrigger = 'offer_deadline_event' | 'closed_accepted' | 'manual';

// Discriminated by `type` so each activity flavor's `metadata` is type-checked at the
// call site. `metadata` is the structured payload analytics reads (ADR-0002); the FE
// renders timeline text from `type` + `metadata`, not from `description`.
type ActivityInput =
  | { type: 'created' }
  | { type: 'stage_change'; metadata: { from: BoardStage; to: BoardStage } }
  | { type: 'sub_stage_change'; metadata: { from?: string | null; to: string | null } }
  | { type: 'note_added' }
  | { type: 'response_received'; metadata: { trigger: ResponseTrigger } }
  | { type: 'offer_received'; metadata: { trigger: OfferTrigger } }
  | {
      type: 'event_scheduled' | 'event_completed' | 'event_cancelled';
      metadata: { eventId: string; eventType: EventType };
    }
  | { type: 'resume_changed'; metadata: { from: string | null; to: string | null } }
  | { type: 'closed'; metadata: { outcome: ClosedOutcome } };

type LogActivityParams = {
  applicationId: string;
  description?: string;
  occurredAt?: Date;
} & ActivityInput;

/**
 * The primitive writer. Inserts exactly one typed activity_log row. Callers pass a
 * transaction handle (or the db singleton) so the row commits atomically with the
 * state change that produced it.
 */
export async function logActivity(executor: DbExecutor, params: LogActivityParams) {
  const { applicationId, description, occurredAt, type } = params;

  await executor.insert(activityLog).values({
    applicationId,
    type,
    description,
    metadata: 'metadata' in params ? params.metadata : null,
    // omit when undefined so the column default (now()) applies
    ...(occurredAt ? { occurredAt } : {}),
  });
}

async function hasActivity(executor: DbExecutor, applicationId: string, type: ActivityInput['type']) {
  const [row] = await executor
    .select({ id: activityLog.id })
    .from(activityLog)
    .where(and(eq(activityLog.applicationId, applicationId), eq(activityLog.type, type)))
    .limit(1);

  return row !== undefined;
}

/**
 * Writes `response_received` only if the application has none yet — the "first response"
 * the funnel and ghost clock read (ADR-0002). Returns whether a new row was written.
 */
export async function ensureResponseReceived(
  executor: DbExecutor,
  params: { applicationId: string; trigger: ResponseTrigger; occurredAt?: Date },
) {
  if (await hasActivity(executor, params.applicationId, 'response_received')) {
    return false;
  }

  await logActivity(executor, {
    applicationId: params.applicationId,
    type: 'response_received',
    metadata: { trigger: params.trigger },
    occurredAt: params.occurredAt,
  });

  return true;
}

/**
 * Writes `offer_received` only if the application has none yet (backfill-safe). Returns
 * whether a new row was written.
 */
export async function ensureOfferReceived(
  executor: DbExecutor,
  params: { applicationId: string; trigger: OfferTrigger; occurredAt?: Date },
) {
  if (await hasActivity(executor, params.applicationId, 'offer_received')) {
    return false;
  }

  await logActivity(executor, {
    applicationId: params.applicationId,
    type: 'offer_received',
    metadata: { trigger: params.trigger },
    occurredAt: params.occurredAt,
  });

  return true;
}

/**
 * Stamps a `stage_change` and auto-derives the first `response_received` the first time an
 * application advances out of Applied (=> Active/Final Stages). Closing goes through
 * recordClose, not here.
 */
export async function recordStageChange(
  executor: DbExecutor,
  params: { applicationId: string; from: BoardStage; to: BoardStage; occurredAt?: Date },
) {
  const { applicationId, from, to, occurredAt } = params;

  await logActivity(executor, {
    applicationId,
    type: 'stage_change',
    metadata: { from, to },
    occurredAt,
  });

  if (from === 'applied' && (to === 'active' || to === 'final_stages')) {
    await ensureResponseReceived(executor, { applicationId, trigger: 'stage_advance', occurredAt });
  }
}

/**
 * Writes the `closed` row and derives the milestones its outcome implies: a rejection is a
 * (first) response; an acceptance is a (backfilled) offer. `ghosted`/`withdrawn` imply
 * neither — by definition a ghosted application never received a response.
 */
export async function recordClose(
  executor: DbExecutor,
  params: { applicationId: string; outcome: ClosedOutcome; occurredAt?: Date },
) {
  const { applicationId, outcome, occurredAt } = params;

  await logActivity(executor, {
    applicationId,
    type: 'closed',
    metadata: { outcome },
    occurredAt,
  });

  if (outcome === 'rejected') {
    await ensureResponseReceived(executor, { applicationId, trigger: 'closed_rejected', occurredAt });
  } else if (outcome === 'accepted') {
    await ensureOfferReceived(executor, { applicationId, trigger: 'closed_accepted', occurredAt });
  }
}
