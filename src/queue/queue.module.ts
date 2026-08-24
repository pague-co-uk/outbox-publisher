import { Module } from "@nestjs/common";


import { queueProvider } from "./queue.provider.js";
import { QueueService } from "./queue.service.js";
import { QUEUE_CLIENT } from "./constants/queue.constants.js";

@Module({
  providers: [
    queueProvider,
    QueueService,
  ],

  exports: [
    QUEUE_CLIENT,
  ],
})
export class QueueModule {}