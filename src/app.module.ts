import {
  Module,
} from "@nestjs/common";

import {
  ConfigModule,
} from "./config/config.module.js";

import {
  DatabaseModule,
} from "./database/database.module.js";

import {
  QueueModule,
} from "./queue/queue.module.js";

import {
  OutboxModule,
} from "./outbox/outbox.module.js";

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    QueueModule,
    OutboxModule,
  ],
})
export class AppModule { }