import { Module } from '@nestjs/common';
import { ExchangeratesService } from './exchangerates.service';
import { HttpModule } from "@nestjs/axios";
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [HttpModule],
  providers: [ExchangeratesService],
  exports: [ExchangeratesService],
})
export class AppClientModule {}
