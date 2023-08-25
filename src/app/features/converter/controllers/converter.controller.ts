import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BaseController } from '@src/index';
import { Response } from 'express';
import { ConverterService } from '../services/converter.service';
import { FindAllService } from '../services/find-all.service';
import { JwtAuthGuard } from '@src/app/auth/guards/jwt-auth.guard';

@Controller('converter')
export class ConverterController extends BaseController {
  constructor(
    private converterService: ConverterService,
    private findAllService: FindAllService,
  ) {
    super();
  }

  @UseGuards(JwtAuthGuard)
  @Post(':to/:amount/:from?')
  public async converter(
    @Param() params: { to: string; amount: number; from?: string },
    @Req() req,
    @Res() res: Response,
  ): Promise<void> {
    const { from, to, amount } = params;

    try {
      const converter = await this.converterService.execute({
        to,
        amount: +amount,
        from,
        user: req.user.id,
      });
      res.status(201).json(converter);
    } catch (err) {
      this.sendCreateUpdateErrorResponse(res, err);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('all')
  public async listAll(@Res() res: Response): Promise<void> {
    try {
      const listAll = await this.findAllService.execute();
      res.status(200).json(listAll);
    } catch (err) {
      this.sendErrorResponse(res, err);
    }
  }
}
