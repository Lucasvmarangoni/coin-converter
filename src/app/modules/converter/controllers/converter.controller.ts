import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ConverterService } from '@src/app/modules/converter/services/converter.service';
import { FindAllService } from '@src/app/modules/converter/services/find-all.service';
import { CacheTTL } from '@nestjs/cache-manager';
import { DeleteService } from '@src/app/modules/converter/services/delete.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ttlOneHour } from '@src/app/common/rate-limiter/util/ttl-rate-limiter';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import {
  schemaOkDeletedResponse,
  schemaOkResponse,
} from '@src/docs/schemas/converter-schemas';
import { JwtAuthGuard } from '@src/app/modules/auth/guards/jwt-auth.guard';

// @UseInterceptors(CacheInterceptor)
@ApiTags('converter')
@SkipThrottle()
@Controller('converter')
export class ConverterController {
  constructor(
    private readonly converterService: ConverterService,
    private readonly findAllService: FindAllService,
    private readonly deleteAllService: DeleteService
  ) {}

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create one transaction to converter currency.',
    description: `
    \n This route is used to currency converter.

    \n It's possible converter 'from' any currencies and 'to' many and any currencies. As long as they are valid currency acronyms (ISO).

    \n When provided with multiple 'to' currencies, they should be separated by commas. For example: USD, BRL, 100, AMD.

    Authenticated\nThis route applies an authentication middleware to control the access to the route.It allows access only to authenticated user.

    Rate-limiter\nThis route applies a rate limiter middleware to control the number of requests allowed in a certain period of time.
    It allows a maximum of 30 requests every 2 hour.
    `,
  })
  @ApiCreatedResponse({
    description: 'The converter has been successfully created.',
    schema: schemaOkResponse,
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ long: { limit: 30, ttl: ttlOneHour * 2 } })
  @CacheTTL(360 * 100)
  @Post(':to/:amount/:from?')
  public async converter(
    @Param() params: { to: string; amount: number; from: string },
    @Req() req: Request,
    @Res() res: Response
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

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Query all transaction.',
    description: `
    \n This route is used to query all transaction.    

    Authenticated\nThis route applies an authentication middleware to control the access to the route.It allows access only to authenticated user.

    Rate-limiter\nThis route applies a rate limiter middleware to control the number of requests allowed in a certain period of time.
    It allows a maximum of 5 requests every 1 hour.
    `,
  })
  @ApiOkResponse({
    description: 'The transaction has been successfully query.',
    schema: {
      type: 'array',
      items: schemaOkResponse,
    },
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ short: { limit: 5, ttl: ttlOneHour } })
  @CacheTTL(360 * 100)
  @Get('all')
  public async listAll(@Req() req: Request, @Res() res: Response): Promise<void> {
    const { id, email } = req.user;
    const listAll = await this.findAllService.execute(id, email);
    res.status(200).json(listAll);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Query all transaction.',
    description: `
    \n This route is used to query all transaction.    

    Authenticated\nThis route applies an authentication middleware to control the access to the route.It allows access only to authenticated user.

    Rate-limiter\nThis route applies a rate limiter middleware to control the number of requests allowed in a certain period of time.
    It allows a maximum of 5 requests every 1 hour.
    `,
  })
  @ApiOkResponse({
    description: 'Delete all transaction.',
    schema: schemaOkDeletedResponse,
  })
  @UseGuards(JwtAuthGuard)
  @SkipThrottle({ default: true })
  @Delete('delete')
  async delete(@Req() req: Request, @Res() res: Response) {
    await this.deleteAllService.execute(req.user);
    return res.status(200).json({
      message: 'You transactions are deleted successful',
    });
  }
}
