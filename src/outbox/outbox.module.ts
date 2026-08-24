import { Module } from "@nestjs/common";

import { DatabaseModule } from "../database/database.module.js";

import { QueueModule } from "../queue/queue.module.js";
import { OutboxEventRepository } from "../repositories/outbox-event.repository.js";
import { OutboxPublisher } from "./outbox.publisher.js";

@Module({
  imports: [
    DatabaseModule,
    QueueModule
  ],

  providers: [
    OutboxEventRepository,
    OutboxPublisher,
  ],
})
export class OutboxModule { }