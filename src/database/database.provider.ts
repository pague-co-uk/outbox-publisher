import {
  Provider,
} from "@nestjs/common";

import {
  PrismaClient,
} from "@prisma/client";

import {
  AppConfigService,
} from "../config/config.service.js";

import {
  DATABASE,
} from "./database.constants.js";

export const databaseProvider: Provider = {
  provide: DATABASE,

  inject: [
    AppConfigService,
  ],

  useFactory: async (
    config: AppConfigService,
  ) => {
    const client =
      new PrismaClient({
        datasourceUrl:
          config.databaseUrl,
      });

    await client.$connect();

    return client;
  },
};