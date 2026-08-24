import {
  Inject,
  Injectable,
  OnApplicationShutdown,
} from "@nestjs/common";
import { QueueClient } from "@pague-co-uk/sms-gateway-queue-client";
import {
  Loggers,
} from "@pague-co-uk/sms-gateway-telemetry";

import { QUEUE_CLIENT } from "./constants/queue.constants.js";

@Injectable()
export class QueueService
  implements OnApplicationShutdown {
  private readonly logger = Loggers.rabbitmq;

  constructor(
    @Inject(QUEUE_CLIENT)
    private readonly client: QueueClient,
  ) { }

  public async onApplicationShutdown(): Promise<void> {
    this.logger.info(
      "Shutting down RabbitMQ client.",
    );

    try {
      await this.client.close();

      this.logger.info(
        "RabbitMQ client shut down successfully.",
      );
    } catch (error) {
      this.logger.error(
        { error },
        "Failed to shut down RabbitMQ client.",
      );
    }
  }
}