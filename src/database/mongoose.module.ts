import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { MongooseError } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('MongooseModule');
        return {
          uri: configService.get('database').uri,
          connectionFactory: (connection: any, name: string) => {
            logger.log(`Creating connection for ${name}`);
            return connection;
          },
          connectionErrorFactory: (error: MongooseError) => {
            logger.error(`Error during connection: ${error.message}`);
            return new MongooseError('Custom connection error occurred.');
          },
        };
      },
      inject: [ConfigService],
    }),
    // MongooseModule.forRoot(process.env.DATABASE_URL, {
    //   connectionName: 'User',
    // }),
  ],
})
export class AppMongooseModule {}
