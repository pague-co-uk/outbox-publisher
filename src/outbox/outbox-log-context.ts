/** Correlate publication without logging message content or connector credentials. */
export function outboxLogContext(event: { aggregateType: string; aggregateId: string; payload: unknown }) {
  const payload = event.payload && typeof event.payload === "object" && !Array.isArray(event.payload)
    ? event.payload as Record<string, unknown> : {};
  return {
    aggregateType: event.aggregateType,
    aggregateId: event.aggregateId,
    messageId: typeof payload.messageId === "string" ? payload.messageId : undefined,
    attemptId: typeof payload.attemptId === "string" ? payload.attemptId : undefined,
    manualRetryEventId: typeof payload.manualRetryEventId === "string" ? payload.manualRetryEventId : undefined,
  };
}
