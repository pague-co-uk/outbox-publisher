import {
  Injectable,
} from "@nestjs/common";

import {
  ConfigService,
} from "@nestjs/config";

@Injectable()
export class AppConfigService {
  constructor(
    private readonly config:
      ConfigService,
  ) { }

  // =========================================================================
  // Application
  // =========================================================================

  get app() {
    return {
      name:
        this.config.getOrThrow<string>(
          "app.name",
        ),

      version:
        this.config.getOrThrow<string>(
          "app.version",
        ),

      environment:
        this.config.getOrThrow<string>(
          "app.environment",
        ),

      host:
        this.config.getOrThrow<string>(
          "app.host",
        ),

      port:
        this.config.getOrThrow<number>(
          "app.port",
        ),
    };
  }

  // =========================================================================
  // Database
  // =========================================================================

  get databaseUrl(): string {
    return this.config.getOrThrow<string>(
      "database.url",
    );
  }

  // =========================================================================
  // RabbitMQ
  // =========================================================================

  get rabbitmq() {
    return {
      url:
        this.config.getOrThrow<string>(
          "rabbitmq.url",
        ),
    };
  }

  // =========================================================================
  // Outbox
  // =========================================================================

  get outbox() {
    return {
      pollIntervalMillis:
        this.config.getOrThrow<number>(
          "outbox.pollIntervalMillis",
        ),

      batchSize:
        this.config.getOrThrow<number>(
          "outbox.batchSize",
        ),

      maxAttempts:
        this.config.getOrThrow<number>(
          "outbox.maxAttempts",
        ),

      staleAfterMillis:
        this.config.getOrThrow<number>(
          "outbox.staleAfterMillis",
        ),
    };
  }

  // =========================================================================
  // Logging
  // =========================================================================

  get log() {
    return {
      level:
        this.config.getOrThrow<string>(
          "log.level",
        ),

      stdout:
        this.config.getOrThrow<boolean>(
          "log.stdout",
        ),

      file: {
        enabled:
          this.config.getOrThrow<boolean>(
            "log.file.enabled",
          ),

        path:
          this.config.getOrThrow<string>(
            "log.file.path",
          ),
      },
    };
  }

  // =========================================================================
  // OpenTelemetry
  // =========================================================================

  get telemetry() {
    return {
      enabled:
        this.config.getOrThrow<boolean>(
          "telemetry.enabled",
        ),

      serviceName:
        this.config.getOrThrow<string>(
          "telemetry.serviceName",
        ),

      serviceVersion:
        this.config.getOrThrow<string>(
          "telemetry.serviceVersion",
        ),

      tracesEndpoint:
        this.config.getOrThrow<string>(
          "telemetry.tracesEndpoint",
        ),

      metricsEndpoint:
        this.config.getOrThrow<string>(
          "telemetry.metricsEndpoint",
        ),

      logsEndpoint:
        this.config.getOrThrow<string>(
          "telemetry.logsEndpoint",
        ),

      exportIntervalMillis:
        this.config.getOrThrow<number>(
          "telemetry.exportIntervalMillis",
        ),

      disableFsInstrumentation:
        this.config.getOrThrow<boolean>(
          "telemetry.disableFsInstrumentation",
        ),
    };
  }
}