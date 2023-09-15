import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUpdateUserDto {
  @ApiProperty({
    example: 'John Doe',
    description: `The name of the person who is registering.`,
    required: true,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'john123',
    description: `The desired username to be used for registration.`,
    required: true,
    maxLength: 15,
  })
  @IsString()
  @MaxLength(15)
  username: string;

  @ApiProperty({
    example: 'john@mail.com',
    description: `Some email to be used for registration.`,
    required: true,
    format: `email format.`,
  })
  @IsString()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'jhVI7865BV&*R6&$%aA@',
    description: `The user's login password.`,
    required: true,
    format: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/`,
    minLength: 10,
    maxLength: 100,
  })
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/, {
    message:
      'The password format is invalid! It must contain at least one lowercase letter, one uppercase letter, one digit, one symbol, and have a minimum length of 10 characters.',
  })
  password: string;
}
