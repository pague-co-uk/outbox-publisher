import "dotenv/config";

import {
  getLogger,
  initTelemetry,
  shutdownTelemetry,
  TelemetryLogger,
} from "@pague-co-uk/sms-gateway-telemetry";

import configuration from "./config/configuration.js";

async function bootstrap(): Promise<void> {
  const config =
    configuration();

  // =========================================================================
  // Telemetry MUST be initialized before Nest creates providers.
  // =========================================================================

  initTelemetry({
    enabled:
      config.telemetry.enabled,

    registerShutdownHooks:
      false,

    service: {
      name:
        config.telemetry.serviceName,

      version:
        config.telemetry.serviceVersion,
    },

    collector: {
      tracesEndpoint:
        config.telemetry.tracesEndpoint,

      metricsEndpoint:
        config.telemetry.metricsEndpoint,

      logsEndpoint:
        config.telemetry.logsEndpoint,
    },

    metrics: {
      exportIntervalMillis:
        config.telemetry
          .exportIntervalMillis,
    },

    logger: {
      level:
        config.log.level,

      transport: {
        stdout:
          config.log.stdout,

        file:
          config.log.file,
      },
    },

    instrumentations: {
      disableFs:
        config.telemetry
          .disableFsInstrumentation,
    },
  });

  const logger =
    getLogger();

  // =========================================================================
  // Nest
  // =========================================================================

  const [
    { NestFactory },
    { AppModule },
  ] = await Promise.all([
    import("@nestjs/core"),
    import("./app.module.js"),
  ]);

  const app =
    await NestFactory.create(
      AppModule,
    );

  app.useLogger(
    new TelemetryLogger(),
  );

  await app.listen(
    config.app.port,
    config.app.host,
  );

  logger.info(
    {
      service:
        config.app.name,

      version:
        config.app.version,

      environment:
        config.app.environment,

      host:
        config.app.host,

      port:
        config.app.port,

      healthEndpoint:
        "/health",
    },
    "Outbox publisher started successfully.",
  );

  // =========================================================================
  // Shutdown
  // =========================================================================

  const gracefulShutdown =
    async (
      signal: string,
    ): Promise<void> => {
      logger.info(
        {
          signal,
        },
        "Shutting down outbox publisher.",
      );

      try {
        await app.close();

        await shutdownTelemetry();

        process.exit(0);
      } catch (error) {
        logger.error(
          {
            err: error,
            signal,
          },
          "Failed during graceful shutdown.",
        );

        await shutdownTelemetry();

        process.exit(1);
      }
    };

  process.once(
    "SIGINT",
    () => {
      void gracefulShutdown(
        "SIGINT",
      );
    },
  );

  process.once(
    "SIGTERM",
    () => {
      void gracefulShutdown(
        "SIGTERM",
      );
    },
  );
}

void bootstrap();