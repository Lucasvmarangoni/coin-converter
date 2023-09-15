import { Controller, UseGuards, Post, Res, Req, Body } from '@nestjs/common';
import { AuthService } from '@src/app/auth/services/auth.service';
import { LocalAuthGuard } from '@src/app/auth/guards/local-auth.guard';
import { AuthRequest } from '@src/app/auth/models/auth-request';
import { IsPublic } from '../decorators/is-public.decorator';
import { GoogleAuthGuard } from '../guards/google-auth.guard';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { authnResponse, BodyAuthSchema } from '@src/docs/schemas/auth-schemas';

@SkipThrottle({ default: false })
@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}
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
  async login(@Req() req: AuthRequest, @Res() res) {
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
