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
import { ProfileService } from '../services/profile.service';

@Controller('user')
export class UserController {
  constructor(
    private createService: CreateService,
    private deleteService: DeleteService,
    private profileService: ProfileService,
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
  async getProfile(@Req() req, @Res() res) {
    const profile = await this.profileService.execute(req.user);
    return res.status(200).json(profile);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  async delete(@Req() req, @Res() res) {
    await this.deleteService.execute(req.user);
    return res.status(200).json({
      message: 'You account is deleted successful',
    });
  }
}
