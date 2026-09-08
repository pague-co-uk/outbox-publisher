import {
  Injectable,
} from "@nestjs/common";

import {
  Loggers,
} from "@pague-co-uk/sms-gateway-telemetry";

import {
  AppConfigService,
} from "../../config/config.service.js";

// ============================================================================
// Health Service
// ============================================================================

@Injectable()
export class HealthService {
  private readonly logger =
    Loggers.app;

  constructor(
    private readonly config: AppConfigService,
  ) { }

  // ==========================================================================
  // Health check
  // ==========================================================================

  public check() {
    const start =
      performance.now();

    const response = {
      status: "healthy" as const,

      service:
        this.config.app.name,

      version:
        this.config.app.version,

      environment:
        this.config.app.environment,

      uptime:
        Math.round(
          process.uptime(),
        ),

      timestamp:
        new Date().toISOString(),
    };

    const latency =
      Math.round(
        performance.now() -
        start,
      );

    this.logger.debug(
      {
        status:
          response.status,

        latency,
      },
      "Outbox publisher health check completed.",
    );

    return {
      ...response,
      latency,
    };
  }
}