import { User } from '@src/app/models/user';
import { CreateService } from './create.service';
import * as crypto from 'crypto';
import { FindUsersService } from './find.service';
import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { UserResponse } from './models/user-models';

export class CreateForOAuth {
  constructor(
    private readonly createUserService: CreateService,
    @Inject(FindUsersService)
    private readonly findUsersService: FindUsersService,
  ) {}

  async execute(userData: Partial<User>): Promise<UserResponse> {
    const { name, username, email } = userData;
    const password = this.generateRandomPassword(30);
    const generatedUsername = await this.generateRandomUsername(userData, 5);

    return await this.createUserService.execute({
      name,
      email,
      username: username || generatedUsername,
      password,
    });
  }

  private generateRandomPassword(length: number): string {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const symbolChars = '!@#$%^&*()_+[]{}|;:,.<>?';
    const numbers = '0123456789';
    const allChars = uppercaseChars + lowercaseChars + numbers + symbolChars;

    let password: string;

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(0, allChars.length);
      password += allChars.charAt(randomIndex);
    }
    return password;
  }

  private async generateRandomUsername(
    userData: Partial<User>,
    length: number,
  ): Promise<string> {
    const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const characters = uppercaseChars + lowercaseChars + numbers;
    const { name, email } = userData;
    const maxAttempts = 1000;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const usernameArray: string[] = [];

      for (let i = 0; i < length; i++) {
        const randomIndex = crypto.randomInt(0, characters.length);
        usernameArray.push(characters.charAt(randomIndex));
      }

      const username = name.split(' ').join('') + '-' + usernameArray.join('');

      const user = await this.findUsersService.findOne(username);

      if (!user) {
        return username;
      }
      attempts++;
    }

    throw new UnprocessableEntityException(
      'Unprocessable Entity: Error to generate username',
      {
        cause: new Error(),
        description:
          'The server was unable to create a valid username. Please contact support.',
      },
    );
  }
}
