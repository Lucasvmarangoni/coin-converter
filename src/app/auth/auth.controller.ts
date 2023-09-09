import { Controller, UseGuards, Post, Res, Req } from '@nestjs/common';
import { AuthService } from '@src/app/auth/auth.service';
import { LocalAuthGuard } from '@src/app/auth/guards/local-auth.guard';
import { AuthRequest } from '@src/app/auth/models/auth-request';
import { IsPublic } from './decorators/is-public.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @IsPublic()
  @Post('login')
  @UseGuards(LocalAuthGuard)
  async login(@Req() req: AuthRequest, @Res() res) {
    try {
      // res.set('authorization', jwt.access_token);
      res.status(200).json(this.authService.login(req.user));
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  @IsPublic()
  @Post('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async google(@Req() req, @Res() res) {
    try {
      // res.set('authorization', jwt.access_token);
      res.status(200).json(this.authService.login(req.user));
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }
}
