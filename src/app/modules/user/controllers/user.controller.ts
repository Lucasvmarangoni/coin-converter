import {
  Controller,
  Post,
  Res,
  Body,
  // UsePipes,
  // ValidationPipe,
  Delete,
  UseGuards,
  Get,
  Req,
  Put,
  HttpStatus,
} from '@nestjs/common';
import { CreateUpdateUserDto } from './dto/create-dto';
import { CreateService } from '@src/app/modules/user/domain/services/create.service';
import { DeleteService } from '@src/app/modules/user/domain/services/delete.service';
import { Request, Response } from 'express';
import { ProfileService } from '@src/app/modules/user/domain/services/profile.service';
import { UpdateService } from '@src/app/modules/user/domain/services/update.service';
import { SkipThrottle, Throttle } from '@nestjs/throttler';
import { ttlOneHour } from '@src/app/common/rate-limiter/util/ttl-rate-limiter';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  schemaOkDeletedResponse,
  schemaOkResponse,
} from '@src/docs/schemas/user-schemas';
import { JwtAuthGuard } from '@src/app/modules/auth/guards/jwt-auth.guard';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    private readonly createService: CreateService,
    private readonly deleteService: DeleteService,
    private readonly profileService: ProfileService,
    private readonly updateService: UpdateService
  ) {}

  @ApiOperation({
    summary: 'Create user',
    description: `
    This route is used to create a user
    `,
  })
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    schema: schemaOkResponse,
  })
  @SkipThrottle({ default: true })
  @Post('')
  public async create(
    @Body() body: CreateUpdateUserDto,
    @Res() res: Response
  ): Promise<void> {
    const { user } = await this.createService.execute(body);

    res.status(HttpStatus.CREATED).json(user);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'View user profile data',
    description: `
    \n This route is used to view user profile data.

    Authenticated\nThis route applies an authentication middleware to control the access to the route.It allows access only to authenticated user.

    Rate-limiter\nThis route applies a rate limiter middleware to control the number of requests allowed in a certain period of time.
    It allows a maximum of 20 requests every 1 hour.
    `,
  })
  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    schema: schemaOkResponse,
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ medium: { limit: 20, ttl: ttlOneHour } })
  @Get('profile')
  async getProfile(@Req() req: Request, @Res() res: Response) {
    const profile = await this.profileService.execute(req.user);
    return res.status(200).json(profile);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update user data',
    description: `
    \n This route is used to update user data.

    Authenticated\nThis route applies an authentication middleware to control the access to the route.It allows access only to authenticated user.

    Rate-limiter\nThis route applies a rate limiter middleware to control the number of requests allowed in a certain period of time.
    It allows a maximum of 3 requests every 1 hour.    `,
  })
  @ApiOkResponse({
    description: 'The user has been successfully updated.',
    schema: schemaOkResponse,
  })
  @UseGuards(JwtAuthGuard)
  @Throttle({ short: { limit: 3, ttl: ttlOneHour } })
  @Put('update')
  async update(
    @Body() body: CreateUpdateUserDto,
    @Req() req: Request,
    @Res() res: Response
  ) {
    const updateUser = await this.updateService.execute(req.user.email, body);
    return res.status(200).json(updateUser);
  }

  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete user profile',
    description: `
    \n This route is used to delete user profile.

    Authenticated\nThis route applies an authentication middleware to control the access to the route.It allows access only to authenticated user.
   `,
  })
  @ApiOkResponse({
    description: 'The user has been successfully deleted.',
    schema: schemaOkDeletedResponse,
  })
  @UseGuards(JwtAuthGuard)
  @SkipThrottle({ default: true })
  @Delete('delete')
  async delete(@Req() req: Request, @Res() res: Response) {
    await this.deleteService.execute({ email: req.user.email });
    return res.status(200).json({
      message: 'You account is deleted successful',
    });
  }
}
