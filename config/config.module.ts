import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './configuration';
import * as Joi from 'joi';

const node_env = process.env.NODE_ENV || 'development';

const env = {
  environment: `config/.env.${node_env}`,
  secrets: '.env',
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
        DATABASE_URI: Joi.string().required(),
        API_URL: Joi.string().required(),
        API_KEY: Joi.string().required(),
        LOGGER_LEVEL: Joi.string().default('info'),
        LOGGER_ENABLED: Joi.boolean().default(true),
        CACHE_HOST: Joi.string(),
        CACHE_PORT: Joi.number(),
        CACHE_TTL: Joi.number().default(60000),
        CACHE_MAX: Joi.number().default(50),
        CACHE_PASSWORD: Joi.string(),
        GOOGLE_CLIENT_ID: Joi.string().required(),
        GOOGLE_CLIENT_SECRET: Joi.string().required(),
        EXPRESS_SESSION_SECRET: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }).unknown(),
      validationOptions: {
        allowUnknown: false,
        abortEarly: false,
      },
    }),
  ],
})
export class AppConfigModule {}
