export default () => ({
  // ===========================================================================
  // Application
  // ===========================================================================

  app: {
    name:
      process.env.APP_NAME ??
      "outbox-publisher",

    version:
      process.env.APP_VERSION ??
      "1.0.0",

    environment:
      process.env.NODE_ENV ??
      "development",

    host:
      process.env.APP_HOST ??
      "0.0.0.0",

    port:
      Number.parseInt(
        process.env.APP_PORT ??
        "9002",
        10,
      ),
  },

  // ===========================================================================
  // Database
  // ===========================================================================

  database: {
    url:
      process.env.DATABASE_URL!,
  },

  // ===========================================================================
  // RabbitMQ
  // ===========================================================================

  rabbitmq: {
    url:
      process.env.RABBITMQ_URL!,

    connectionName:
      process.env.RABBITMQ_CONNECTION_NAME ??
      "outbox-publisher",

    heartbeat:
      Number.parseInt(
        process.env.RABBITMQ_HEARTBEAT ??
        "60",
        10,
      ),

    reconnectDelay:
      Number.parseInt(
        process.env.RABBITMQ_RECONNECT_DELAY ??
        "1000",
        10,
      ),

    maxReconnectDelay:
      Number.parseInt(
        process.env.RABBITMQ_MAX_RECONNECT_DELAY ??
        "30000",
        10,
      ),

    maxReconnectAttempts:
      process.env.RABBITMQ_MAX_RECONNECT_ATTEMPTS
        ? Number.parseInt(
          process.env
            .RABBITMQ_MAX_RECONNECT_ATTEMPTS,
          10,
        )
        : undefined,
  },

  // ===========================================================================
  // Telemetry
  // ===========================================================================

  telemetry: {
    enabled:
      process.env.OTEL_ENABLED !==
      "false",

    serviceName:
      process.env.OTEL_SERVICE_NAME ??
      "outbox-publisher",

    serviceVersion:
      process.env.OTEL_SERVICE_VERSION ??
      "1.0.0",

    tracesEndpoint:
      process.env.OTEL_TRACES_ENDPOINT ??
      "",

    metricsEndpoint:
      process.env.OTEL_METRICS_ENDPOINT ??
      "",

    logsEndpoint:
      process.env.OTEL_LOGS_ENDPOINT ??
      "",

    exportIntervalMillis:
      Number.parseInt(
        process.env
          .OTEL_EXPORT_INTERVAL_MILLIS ??
        "10000",
        10,
      ),

    disableFsInstrumentation:
      process.env
        .OTEL_DISABLE_FS_INSTRUMENTATION ===
      "true",
  },

  // ===========================================================================
  // Logging
  // ===========================================================================

  log: {
    level:
      process.env.LOG_LEVEL ??
      "info",

    stdout:
      process.env.LOG_STDOUT !==
      "false",

    file: {
      enabled:
        process.env.LOG_FILE_ENABLED ===
        "true",

      path:
        process.env.LOG_FILE_PATH ??
        "./logs/outbox-publisher.log",
    },
  },

  // ===========================================================================
  // Outbox
  // ===========================================================================

  outbox: {
    batchSize:
      Number.parseInt(
        process.env.OUTBOX_BATCH_SIZE ??
        "50",
        10,
      ),

    pollIntervalMillis:
      Number.parseInt(
        process.env
          .OUTBOX_POLL_INTERVAL_MILLIS ??
        "1000",
        10,
      ),

    staleAfterMillis:
      Number.parseInt(
        process.env
          .OUTBOX_STALE_AFTER_MILLIS ??
        "300000",
        10,
      ),

    maxAttempts:
      Number.parseInt(
        process.env.OUTBOX_MAX_ATTEMPTS ??
        "10",
        10,
      ),
  },
});