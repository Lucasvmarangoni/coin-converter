import { IsEmail, IsString, Matches, MaxLength, MinLength } from "class-validator";

export class CreateUserDto {
    @IsString()
    @MaxLength(100)
    name: string;

    @IsString()
    @MaxLength(15)
    username: string;

    @IsString()
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(10)
    @MaxLength(100)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+$/,
        {
            message: 
            'The password format is invalid! It must contain at least one lowercase letter, one uppercase letter, one digit, one symbol, and have a minimum length of 10 characters.'
        })
    password: string;
}