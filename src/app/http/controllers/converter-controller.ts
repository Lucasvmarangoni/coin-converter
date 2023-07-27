import { Controller, Get, Param, Post, Req, Res } from '@nestjs/common';
import { FindAllService } from '@src/app/services/find';
import { Request, Response } from 'express';
import { BaseController } from './index';
import { ConverterService } from '@src/app/services/converter';
import { resolveSoa } from 'dns';

@Controller('converter')
export class ConverterController extends BaseController {

  constructor(private converterService: ConverterService,
    private findAllService: FindAllService) {
    super();
  }

  @Post(':to/:amount/:from?')
  public async converter(
    @Param() params: { to: string, amount: number, from?: string, },
    @Req() req: Request,
    @Res() res: Response):
    Promise<void> {
    const { from, to, amount } = params;

    try {
      const converter = await this.converterService.execute({ to, amount: +amount, from });
      res.status(201).json(converter);      
    } catch (err) {
      this.sendCreateUpdateErrorResponse(res, err)
    }
  }
}
