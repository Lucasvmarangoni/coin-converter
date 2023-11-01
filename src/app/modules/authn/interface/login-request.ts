import { IsEmail, IsString } from 'class-validator';

export class LoginRequestBodyByEmail {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class LoginRequestBodyByUsername {
  @IsString()
  username: string;

  @IsString()
  password: string;
}
