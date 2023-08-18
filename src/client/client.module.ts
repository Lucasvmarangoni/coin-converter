import { Module } from '@nestjs/common';
import { ExchangeratesService } from './exchangerates.service';
import { HttpModule } from "@nestjs/axios";

@Module({
  imports: [HttpModule],
  providers: [ExchangeratesService],
  exports: [ExchangeratesService],
})
export class AppClientModule {}
