import { createCounterMetric, createHistogramMetric, createSnapshotGaugeMetric, recordMetricSafely } from '@pague-co-uk/sms-gateway-telemetry';

export type PublicationOutcome = 'published' | 'retry_scheduled' | 'permanently_failed' | 'state_not_changed' | 'persistence_error';
export interface OutboxSnapshotRow { status: string; eventType: string; _count: { _all: number }; _min: { availableAt: Date | null } }
const eventTypes = new Set(['CONNECTOR_DISPATCH', 'MESSAGE_MANUAL_RETRY', 'MESSAGE_STATUS', 'MESSAGE_SUBMISSION']);
const snapshotInterval = Number(process.env.OUTBOX_METRICS_SNAPSHOT_INTERVAL_MS);
const eventType = (value: string) => eventTypes.has(value) ? value : 'OTHER';

export class OutboxMetrics {
  private readonly publications = createCounterMetric({ name: 'outbox.publication.attempts', description: 'Publication attempts classified by persisted outcome; persistence_error/state_not_changed are not success.' });
  private readonly duration = createHistogramMetric({ name: 'outbox.publication.duration', unit: 'ms', description: 'Publication and state persistence duration, including failures.' });
  private readonly attempts = createHistogramMetric({ name: 'outbox.publication.retry_attempt', description: 'Numeric attempt number of each outbox publication.' });
  private readonly recovered = createCounterMetric({ name: 'outbox.recovery.events', description: 'Stale processing events released for another attempt.' });
  private readonly snapshotErrors = createCounterMetric({ name: 'outbox.snapshot.failures', description: 'Failed read-only outbox state snapshots.' });
  private snapshot: OutboxSnapshotRow[] = [];
  private updatedAt = 0;
  private requestedAt = 0;
  private refreshing = false;
  private readonly interval = Number.isFinite(snapshotInterval) && snapshotInterval >= 10_000 ? snapshotInterval : 60_000;

  constructor() {
    createSnapshotGaugeMetric({ name: 'outbox.events', description: 'Cached database stock by state and bounded event type; replicas must not be summed.' }, () => {
      if (!this.updatedAt || Date.now() - this.updatedAt > this.interval * 2) return [];
      const points = new Map<string, { value: number; attributes: { state: string; event_type: string } }>();
      for (const state of ['PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED']) for (const type of [...eventTypes, 'OTHER']) {
        points.set(`${state}:${type}`, { value: 0, attributes: { state, event_type: type } });
      }
      for (const row of this.snapshot) {
        const point = points.get(`${row.status}:${eventType(row.eventType)}`);
        if (point) point.value += row._count._all;
      }
      return [...points.values()];
    });
    createSnapshotGaugeMetric({ name: 'outbox.pending.oldest_age', unit: 's', description: 'Age since the oldest pending event became available; cached snapshot.' }, () => {
      if (!this.updatedAt || Date.now() - this.updatedAt > this.interval * 2) return [];
      const oldest = this.snapshot.filter(row => row.status === 'PENDING' && row._min.availableAt).map(row => row._min.availableAt!.getTime());
      return [{ value: oldest.length ? Math.max(0, (Date.now() - Math.min(...oldest)) / 1000) : 0 }];
    });
    createSnapshotGaugeMetric({ name: 'outbox.snapshot.age', unit: 's', description: 'Age of the last successful outbox state snapshot.' }, () => this.updatedAt ? [{ value: (Date.now() - this.updatedAt) / 1000 }] : []);
  }

  attempt(type: string, attempt: number, outcome: PublicationOutcome, elapsed: number): void {
    recordMetricSafely(() => {
      const attributes = { event_type: eventType(type), result: outcome };
      this.publications.increment(attributes);
      this.duration.record(elapsed, attributes);
      this.attempts.record(attempt, { event_type: eventType(type) });
    });
  }
  recovery(count: number): void { recordMetricSafely(() => this.recovered.add(count)); }
  async refreshSnapshot(read: () => Promise<OutboxSnapshotRow[]>): Promise<void> {
    if (this.refreshing || Date.now() - this.requestedAt < this.interval) return;
    this.refreshing = true; this.requestedAt = Date.now();
    try { this.snapshot = await read(); this.updatedAt = Date.now(); }
    catch { recordMetricSafely(() => this.snapshotErrors.increment()); }
    finally { this.refreshing = false; }
  }
}
