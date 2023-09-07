import {
  Controller,
  Post,
  Res,
  Body,
  UsePipes,
  ValidationPipe,
  Delete,
  UseGuards,
  Get,
  Req,
} from '@nestjs/common';
import { CreateUserDto } from './dto/user-dto';
import { CreateService } from '../services/create.service';
import { DeleteService } from '../services/delete.service';
import { Response } from 'express';
import { JwtAuthGuard } from '@src/app/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private createService: CreateService,
    private deleteService: DeleteService,
  ) {}

  @Post('')
  @UsePipes(ValidationPipe)
  public async create(
    @Body() body: CreateUserDto,
    @Res() res: Response,
  ): Promise<void> {
    const { user } = await this.createService.execute(body);
    res.status(201).json(user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Delete('delete')
  @UseGuards(JwtAuthGuard)
  delete(@Req() req, @Res() res) {
    this.deleteService.execute(req.user);
    return res.status(200).json({
      message: 'You account is deleted successful',
    });
  }
}
