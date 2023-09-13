import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { ConverterService } from '../services/converter.service';
import { FindAllService } from '../services/find-all.service';
import { JwtAuthGuard } from '@src/app/auth/guards/jwt-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { DeleteService } from '../services/delete.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ttlOneHour } from '@src/modules/util/ttl-rate-limiter';

// @UseInterceptors(CacheInterceptor)
@SkipThrottle()
@Controller('converter')
export class ConverterController {
  constructor(
    private converterService: ConverterService,
    private findAllService: FindAllService,
    private deleteAllService: DeleteService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Throttle({ long: { limit: 30, ttl: ttlOneHour * 2 } })
  @CacheTTL(360 * 100)
  @Post(':to/:amount/:from?')
  public async converter(
    @Param() params: { to: string; amount: number; from?: string },
    @Req() req,
    @Res() res: Response,
  ): Promise<void> {
    const { from, to, amount } = params;

    const converter = await this.converterService.execute({
      to,
      amount: +amount,
      from,
      user: req.user,
    });
    res.status(201).json(converter);
  }

  @UseGuards(JwtAuthGuard)
  @Throttle({ short: { limit: 5, ttl: ttlOneHour } })
  @CacheTTL(360 * 100)
  @Get('all')
  public async listAll(@Req() req, @Res() res): Promise<void> {
    const { id, email } = req.user;
    const listAll = await this.findAllService.execute(id, email);
    res.status(200).json(listAll);
  }

  @UseGuards(JwtAuthGuard)
  @SkipThrottle({ default: true })
  @Delete('delete')
  async delete(@Req() req, @Res() res) {
    await this.deleteAllService.execute(req.user);
    return res.status(200).json({
      message: 'You transactions are deleted successful',
    });
  }
}
