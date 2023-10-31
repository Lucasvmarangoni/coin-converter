import { Controller, UseGuards, Post, Res, Req, Get } from '@nestjs/common';
import { IsPublic } from '@src/app/modules/auth/decorators/is-public.decorator';
import { GoogleAuthGuard } from '@src/app/modules/auth/guards/google-auth.guard';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { authnResponse, BodyAuthSchema } from '@src/docs/schemas/auth-schemas';
import { LocalAuthGuard } from '@src/app/modules/auth/guards/local-auth.guard';
import { AuthRequest } from '@src/app/modules/auth/models/auth-request';
import { AuthService } from '@src/app/modules/auth/services/auth.service';
import { Response } from 'express';

@SkipThrottle({ default: false })
@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiOperation({
    summary: 'Local authenticate user',
    description: `
    This route is used to authenticate a user

    Is possible authenticate with username or email.
    `,
  })
  @ApiBody({
    description:
      'Authentication with either email or username in this same route. Provide only one of them.',
    schema: BodyAuthSchema,
  })
  @ApiOkResponse({
    description: 'The user has been successfully created.',
    schema: authnResponse,
  })
  @IsPublic()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Req() req: AuthRequest, @Res() res: Response) {
    try {
      // res.set('authorization', jwt.access_token);
      res.status(200).json(this.authService.login(req.user));
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }

  @ApiOperation({
    summary: 'OAuth google authenticate user',
    description: `
    This route is used to authenticate a user
    `,
  })
  @IsPublic()
  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async google(@Req() req: AuthRequest, @Res() res: Response) {
    try {
      // res.set('authorization', jwt.access_token);
      res.status(200).json(this.authService.login(req.user));
    } catch (err) {
      return res.status(401).json({ error: err.message });
    }
  }
}
