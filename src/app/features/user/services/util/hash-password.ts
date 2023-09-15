import { BadRequestException } from '@nestjs/common';
import { AuthService } from '@src/app/auth/services/auth.service';

export class HashPassword {
  async hash(password: string): Promise<string> {
    if (password) {
      const hashedPassword = await AuthService.hashPassword(password);
      return hashedPassword;
    }
    throw new BadRequestException('Failed to hash password', {
      cause: new Error(),
      description: `'password don't provided`,
    });
  }
}
