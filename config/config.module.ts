import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';

const node_env = process.env.NODE_ENV || 'development';

const env = {
  environment: `config/.env.${node_env}`,
  secrets: 'config/secrets.env',
  default: 'config/default.env',
};

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [env.environment, env.default, env.secrets],
      load: [configuration],
      isGlobal: true,
      cache: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'test')
          .default('development'),
        PORT: Joi.number().default(3333),
        DATABASE_URL: Joi.string().required(),
        API_URL: Joi.string().required(),
        API_KEY: Joi.string().required(),
        LOGGER_LEVEL: Joi.string().default('info'),
        LOGGER_ENABLED: Joi.boolean().default(true),
      }).unknown(),
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),
  ],
})
export class AppConfigModule {}
