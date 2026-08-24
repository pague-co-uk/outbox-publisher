export interface OutboxConfig {
  readonly pollIntervalMillis: number;
  readonly batchSize: number;
  readonly maxAttempts: number;
  readonly staleAfterMillis: number;
}

export interface AppConfig {
  readonly databaseUrl: string;

  readonly rabbitmq: {
    readonly url: string;
  };

  readonly outbox: OutboxConfig;
}