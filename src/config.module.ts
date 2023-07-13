import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from 'config/configuration';
import * as Joi from 'joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        'config/default.env',
        'config/test.env',
        'config/secrets.env',
      ],
      load: [configuration],
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test')
          .default('development'),
        PORT: Joi.number().default(3333),
        DATABASE_URL: Joi.string().required(),
        TEST_DATABASE_URL: Joi.string().required(),
        API_URL: Joi.string().required(),
        API_KEY: Joi.string().required(),
        TEST_KEY: Joi.string().required(),
        LOGGER_LEVEL: Joi.string().required().default('info'),
        LOGGER_ENABLED: Joi.boolean().required().default(true),
        TEST_LOGGER_ENABLED: Joi.boolean().required().default(false),
      }).unknown(),
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),
  ],
})
export class AppConfigModule {}
