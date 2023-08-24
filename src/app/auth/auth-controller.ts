import {
  Controller,
  UseGuards,
  Post,
  Res,
  Get,
  Req,
  HttpCode,
  HttpStatus,
  Request,
} from '@nestjs/common';
import { AuthService } from '@src/app/auth/auth.service';
import { JwtAuthGuard } from '@src/app/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from '@src/app/auth/guards/local-auth.guard';
import { AuthRequest } from '@src/app/auth/models/auth-request';
import { Response } from 'express';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Request() req: AuthRequest) {
    return this.authService.login(req.user);

    // try {
    //     res.set('authorization', jwt.access_token);
    //     res.status(200);
    //     return res.json(req.user);
    // } catch (err) {
    //     return res.status(401).json({ error: err.message })
    // }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req, res: Response) {
    return req.user;
  }
}
