import {
  Prisma,
  PrismaClient,
} from "@prisma/client";

export type DatabaseClient =
  | PrismaClient
  | Prisma.TransactionClient;

export type DatabaseOperation =
  | "SELECT"
  | "INSERT"
  | "UPDATE"
  | "DELETE";

export interface DatabaseExecutionResult<
  TResult,
> {
  result: TResult;
  rowsAffected: number;
}

export abstract class DatabaseRepository {
  protected readonly db:
    | PrismaClient
    | Prisma.TransactionClient;

  protected constructor(
    db:
      | PrismaClient
      | Prisma.TransactionClient,
  ) {
    this.db = db;
  }

  // =========================================================================
  // Transaction
  // =========================================================================

  protected async withTransaction<
    TResult,
  >(
    callback: (
      tx: Prisma.TransactionClient,
    ) => Promise<TResult>,
  ): Promise<TResult> {
    /*
     * A transaction client cannot start another transaction.
     *
     * If this repository is already operating inside a transaction,
     * execute the callback directly using the existing transaction.
     */
    if (
      this.isTransactionClient(
        this.db,
      )
    ) {
      return callback(
        this.db,
      );
    }

    return (
      this.db as PrismaClient
    ).$transaction(
      async (tx) => {
        return callback(tx);
      },
    );
  }

  // =========================================================================
  // Execution wrapper
  // =========================================================================

  protected async execute<
    TResult,
  >(
    operation: DatabaseOperation,
    model: string,
    callback: () => Promise<
      DatabaseExecutionResult<TResult>
    >,
  ): Promise<TResult> {
    const startedAt =
      Date.now();

    try {
      const {
        result,
        rowsAffected,
      } = await callback();

      void startedAt;
      void operation;
      void model;
      void rowsAffected;

      return result;
    } catch (error) {
      /*
       * Keep the repository infrastructure deliberately
       * framework-agnostic.
       *
       * Logging/metrics/tracing can be added here later if
       * the standalone application's database infrastructure
       * requires it.
       */
      throw error;
    }
  }

  // =========================================================================
  // Helpers
  // =========================================================================

  private isTransactionClient(
    db: DatabaseClient,
  ): db is Prisma.TransactionClient {
    /*
     * PrismaClient exposes the Prisma client transaction API.
     * TransactionClient does not expose $transaction.
     */
    return !(
      "$transaction" in db
    );
  }
}