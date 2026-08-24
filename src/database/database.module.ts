import {
  Module,
} from "@nestjs/common";

import {
  databaseProvider,
} from "./database.provider.js";
import { DATABASE } from "./database.constants.js";

@Module({
  providers: [
    databaseProvider,
  ],

  exports: [
    DATABASE,
  ],
})
export class DatabaseModule {}