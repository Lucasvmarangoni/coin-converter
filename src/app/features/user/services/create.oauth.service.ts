import { User } from '@src/app/models/user';
import { CreateService } from './create.service';
import * as crypto from 'crypto';
import { FindUser } from '../util/find-user';
import { Inject, UnprocessableEntityException } from '@nestjs/common';
import { UserResponse } from './models/user-models';

export class CreateForOAuth {
  constructor(
    private readonly createUserService: CreateService,
    @Inject(FindUser)
    private readonly findUser: FindUser,
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
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const { name } = userData;
    const maxAttempts = 1000;

    const usersnames = await this.findUser.findAllUsernames();

    for (let attempts = 0; attempts < maxAttempts; ) {
      const generateUsername = this.generateRandomString(
        characters,
        length,
        name,
      );

      const check = usersnames.filter((username) => {
        return username === generateUsername;
      });

      if (check.length === 0) {
        return generateUsername;
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

  private generateRandomString(
    characters: string,
    length: number,
    name: string,
  ): string {
    return Array(length)
      .fill('')
      .map(() => characters.charAt(crypto.randomInt(0, characters.length)))
      .join('')
      .concat(name.replace(/\s/g, '-'));
  }
}
