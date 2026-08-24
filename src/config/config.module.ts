import {
  Global,
  Module,
} from "@nestjs/common";

import {
  ConfigModule as NestConfigModule,
} from "@nestjs/config";

import { AppConfigService } from "./config.service.js";
import { configValidationSchema } from "./config.validation.js";
import configuration from "./configuration.js";

@Global()
@Module({
  imports: [
    NestConfigModule.forRoot({
      isGlobal: true,

      cache: true,

      load: [
        configuration,
      ],

      envFilePath: ".env",

      validationSchema:
        configValidationSchema,

      validationOptions: {
        abortEarly: false,
      },
    }),
  ],

  providers: [
    AppConfigService,
  ],

  exports: [
    AppConfigService,
  ],
})
export class ConfigModule { }