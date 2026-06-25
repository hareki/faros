import { and, eq } from 'drizzle-orm';
import { describe, expect, it } from 'vitest';

import { db } from '@/src/db/client';
import { activityLog } from '@/src/db/schema';
import {
  ensureOfferReceived,
  ensureResponseReceived,
  logActivity,
  recordClose,
  recordStageChange,
} from '@/src/features/activity/db/mutations';
import { createApplication } from '@/src/lib/vitest/helpers/db';

function activitiesOfType(
  applicationId: string,
  type: (typeof activityLog.type.enumValues)[number],
) {
  return db
    .select()
    .from(activityLog)
    .where(and(eq(activityLog.applicationId, applicationId), eq(activityLog.type, type)));
}

describe('logActivity', () => {
  it('writes one typed row with its metadata', async () => {
    const applicationId = await createApplication();

    await logActivity(db, {
      applicationId,
      type: 'stage_change',
      metadata: { from: 'applied', to: 'active' },
    });

    const rows = await activitiesOfType(applicationId, 'stage_change');

    expect(rows).toHaveLength(1);
    expect(rows[0].metadata).toEqual({ from: 'applied', to: 'active' });
  });
});

describe('recordStageChange', () => {
  it('stamps stage_change and the first response when leaving Applied', async () => {
    const applicationId = await createApplication();

    await recordStageChange(db, { applicationId, from: 'applied', to: 'active' });

    expect(await activitiesOfType(applicationId, 'stage_change')).toHaveLength(1);

    const responses = await activitiesOfType(applicationId, 'response_received');

    expect(responses).toHaveLength(1);
    expect(responses[0].metadata).toEqual({ trigger: 'stage_advance' });
  });

  it('writes response_received only once across further advances', async () => {
    const applicationId = await createApplication();

    await recordStageChange(db, { applicationId, from: 'applied', to: 'active' });
    await recordStageChange(db, { applicationId, from: 'active', to: 'final_stages' });

    expect(await activitiesOfType(applicationId, 'stage_change')).toHaveLength(2);
    expect(await activitiesOfType(applicationId, 'response_received')).toHaveLength(1);
  });

  it('does not write response_received for moves that do not leave Applied', async () => {
    const applicationId = await createApplication({ stage: 'active' });

    await recordStageChange(db, { applicationId, from: 'active', to: 'final_stages' });

    expect(await activitiesOfType(applicationId, 'stage_change')).toHaveLength(1);
    expect(await activitiesOfType(applicationId, 'response_received')).toHaveLength(0);
  });
});

describe('recordClose', () => {
  it('derives a response from a rejection', async () => {
    const applicationId = await createApplication();

    await recordClose(db, { applicationId, outcome: 'rejected' });

    expect(await activitiesOfType(applicationId, 'closed')).toHaveLength(1);

    const responses = await activitiesOfType(applicationId, 'response_received');

    expect(responses).toHaveLength(1);
    expect(responses[0].metadata).toEqual({ trigger: 'closed_rejected' });
  });

  it('writes no response for a ghosted close', async () => {
    const applicationId = await createApplication();

    await recordClose(db, { applicationId, outcome: 'ghosted' });

    expect(await activitiesOfType(applicationId, 'closed')).toHaveLength(1);
    expect(await activitiesOfType(applicationId, 'response_received')).toHaveLength(0);
  });

  it('derives an offer from an acceptance', async () => {
    const applicationId = await createApplication();

    await recordClose(db, { applicationId, outcome: 'accepted' });

    const offers = await activitiesOfType(applicationId, 'offer_received');

    expect(offers).toHaveLength(1);
    expect(offers[0].metadata).toEqual({ trigger: 'closed_accepted' });
  });
});

describe('ensure* idempotency', () => {
  it('backfills offer_received at most once', async () => {
    const applicationId = await createApplication();

    const first = await ensureOfferReceived(db, { applicationId, trigger: 'offer_deadline_event' });
    const second = await ensureOfferReceived(db, { applicationId, trigger: 'closed_accepted' });

    expect(first).toBe(true);
    expect(second).toBe(false);
    expect(await activitiesOfType(applicationId, 'offer_received')).toHaveLength(1);
  });

  it('keeps a single response_received across advance then rejection', async () => {
    const applicationId = await createApplication();

    await recordStageChange(db, { applicationId, from: 'applied', to: 'active' });
    await recordClose(db, { applicationId, outcome: 'rejected' });

    const responses = await activitiesOfType(applicationId, 'response_received');

    expect(responses).toHaveLength(1);
    expect(responses[0].metadata).toEqual({ trigger: 'stage_advance' });
    expect(await ensureResponseReceived(db, { applicationId, trigger: 'manual' })).toBe(false);
  });
});
