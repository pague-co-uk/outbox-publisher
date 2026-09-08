import {
  Controller,
  Get,
} from "@nestjs/common";

import {
  HealthService,
} from "../services/health.service.js";

// ============================================================================
// Health Controller
// ============================================================================

@Controller("health")
export class HealthController {
  constructor(
    private readonly healthService: HealthService,
  ) { }

  // ==========================================================================
  // Application health
  // ==========================================================================

  @Get()
  public check() {
    return this.healthService.check();
  }
}