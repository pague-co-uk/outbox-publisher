import {
  Provider,
} from "@nestjs/common";

import {
  createQueueClient,
} from "@pague-co-uk/sms-gateway-queue-client";

import {
  getComponentLogger,
} from "@pague-co-uk/sms-gateway-telemetry";

import {
  AppConfigService,
} from "../config/config.service.js";

import {
  QUEUE_CLIENT,
} from "./constants/queue.constants.js";

export const queueProvider: Provider = {
  provide: QUEUE_CLIENT,

  inject: [
    AppConfigService,
  ],

  useFactory: async (
    config: AppConfigService,
  ) => {
    const logger =
      getComponentLogger(
        "rabbitmq",
      );

    logger.info(
      "Initializing RabbitMQ client.",
    );

    try {
      const client =
        createQueueClient(
          config.rabbitmq,
        );

      await client.connect();

      logger.info(
        "RabbitMQ client initialized.",
      );

      return client;
    } catch (error) {
      logger.error(
        {
          err: error,
        },
        "Failed to initialize RabbitMQ client.",
      );

      throw error;
    }
  },
};