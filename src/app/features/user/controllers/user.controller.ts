import {
  Controller,
  Post,
  Res,
  Body,
  UsePipes,
  ValidationPipe,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto } from './dto/user-dto';
import { CreateUserService } from '../services/create.service';
import { DeleteAllUsersService } from '../services/delete.service';
import { Response } from 'express';
import { JwtAuthGuard } from '@src/app/auth/guards/jwt-auth.guard';

@Controller('user')
export class UserController {
  constructor(
    private createUserService: CreateUserService,
    private deleteAllUsersService: DeleteAllUsersService,
  ) {}

  @Post('')
  @UsePipes(ValidationPipe)
  public async create(
    @Body() body: CreateUserDto,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { user } = await this.createUserService.execute(body);

      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('delete')
  deleteAll() {
    this.deleteAllUsersService.execute();
    return;
  }
}
