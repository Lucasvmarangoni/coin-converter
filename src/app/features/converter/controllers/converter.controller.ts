import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { BaseController } from '@src/index';
import { Request, Response } from 'express';
import { ConverterService } from '../services/converter';
import { FindAllService } from '../services/find-all';

@Controller('converter')
export class ConverterController extends BaseController {
  constructor(
    private converterService: ConverterService,
    private findAllService: FindAllService,
  ) {
    super();
  }

  @Post(':to/:amount/:from?')
  public async converter(
    @Param() params: { to: string; amount: number; from?: string },
    @Res() res: Response,
  ): Promise<void> {
    const { from, to, amount } = params;

    try {
      const converter = await this.converterService.execute({
        to,
        amount: +amount,
        from,
      });
      res.status(201).json(converter);
    } catch (err) {
      this.sendCreateUpdateErrorResponse(res, err);
    }
  }

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
