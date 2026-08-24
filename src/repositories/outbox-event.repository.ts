import {
  Inject,
  Injectable,
} from "@nestjs/common";

import {
  OutboxEventStatus,
  Prisma,
  PrismaClient,
} from "@prisma/client";

import {
  DATABASE,
} from "../database/database.constants.js";

import {
  DatabaseRepository,
} from "../database/database.repository.js";

@Injectable()
export class OutboxEventRepository
  extends DatabaseRepository {
  constructor(
    @Inject(DATABASE)
    db:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    super(db);
  }

  public withDatabase(
    db: Prisma.TransactionClient,
  ): this {
    return new OutboxEventRepository(
      db,
    ) as this;
  }

  // =========================================================================
  // Claim pending events
  // =========================================================================

  async claimPending(
    limit: number,
  ) {
    return this.execute(
      "SELECT",
      "outbox_events",
      async () => {
        const now = new Date();

        /*
         * Select events that are ready for publishing.
         *
         * We deliberately order by availableAt and createdAt
         * so older events are processed first.
         */
        const events =
          await this.db.outboxEvent.findMany({
            where: {
              status:
                OutboxEventStatus.PENDING,

              availableAt: {
                lte: now,
              },
            },

            orderBy: [
              {
                availableAt:
                  "asc",
              },

              {
                createdAt:
                  "asc",
              },
            ],

            take: limit,
          });

        if (
          events.length === 0
        ) {
          return {
            result: [],
            rowsAffected: 0,
          };
        }

        /*
         * Claim the events individually using their current
         * PENDING state as the optimistic concurrency condition.
         *
         * This prevents two publisher instances from both
         * successfully claiming the same event.
         */
        const claimed = [];

        for (
          const event of events
        ) {
          const result =
            await this.db.outboxEvent.updateMany(
              {
                where: {
                  id: event.id,

                  status:
                    OutboxEventStatus.PENDING,
                },

                data: {
                  status:
                    OutboxEventStatus.PROCESSING,

                  attempts: {
                    increment: 1,
                  },

                  processingAt:
                    null,

                  lastError:
                    null,
                },
              },
            );

          if (
            result.count === 1
          ) {
            claimed.push({
              ...event,

              status:
                OutboxEventStatus.PROCESSING,

              attempts:
                event.attempts + 1,
            });
          }
        }

        return {
          result: claimed,

          rowsAffected:
            claimed.length,
        };
      },
    );
  }

  // =========================================================================
  // Mark published
  // =========================================================================

  async markPublished(
    id: string,
  ) {
    return this.execute(
      "UPDATE",
      "outbox_events",
      async () => {
        const result =
          await this.db.outboxEvent.updateMany(
            {
              where: {
                id,

                status:
                  OutboxEventStatus.PROCESSING,
              },

              data: {
                status:
                  OutboxEventStatus.PUBLISHED,

                processingAt:
                  new Date(),

                lastError:
                  null,
              },
            },
          );

        return {
          result,

          rowsAffected:
            result.count,
        };
      },
    );
  }

  // =========================================================================
  // Mark retry
  // =========================================================================

  async markRetry(
    id: string,
    error: string,
    availableAt: Date,
  ) {
    return this.execute(
      "UPDATE",
      "outbox_events",
      async () => {
        const result =
          await this.db.outboxEvent.updateMany(
            {
              where: {
                id,

                status:
                  OutboxEventStatus.PROCESSING,
              },

              data: {
                status:
                  OutboxEventStatus.PENDING,

                availableAt,

                lastError:
                  error,

                processingAt:
                  null,
              },
            },
          );

        return {
          result,

          rowsAffected:
            result.count,
        };
      },
    );
  }

  // =========================================================================
  // Mark permanently failed
  // =========================================================================

  async markFailed(
    id: string,
    error: string,
    processedAt: Date,
  ) {
    return this.execute(
      "UPDATE",
      "outbox_events",
      async () => {
        const result =
          await this.db.outboxEvent.updateMany(
            {
              where: {
                id,

                status:
                  OutboxEventStatus.PROCESSING,
              },

              data: {
                status:
                  OutboxEventStatus.FAILED,

                lastError:
                  error,

                processingAt: processedAt,
              },
            },
          );

        return {
          result,

          rowsAffected:
            result.count,
        };
      },
    );
  }

  // =========================================================================
  // Release stale events
  // =========================================================================

  async releaseStale(
    before: Date,
    now: Date,
  ) {
    return this.execute(
      "UPDATE",
      "outbox_events",
      async () => {
        const result =
          await this.db.outboxEvent.updateMany(
            {
              where: {
                status:
                  OutboxEventStatus.PROCESSING,

                processingAt:
                  null,

                updatedAt: {
                  lt: before,
                },
              },

              data: {
                status:
                  OutboxEventStatus.PENDING,

                availableAt:
                  now,

                lastError:
                  "Released after stale processing timeout.",

                processingAt:
                  null,
              },
            },
          );

        return {
          result,

          rowsAffected:
            result.count,
        };
      },
    );
  }
}