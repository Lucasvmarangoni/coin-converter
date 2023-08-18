import { Injectable } from '@nestjs/common';
import { FindUsersService } from '../services/user/find.service';
import { JwtService } from '@nestjs/jwt';
import { User } from '@src/app/models/user';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        private findUsersService: FindUsersService,
        private jwtService: JwtService,        
    ) { }

    async validateUser(usernameOrEmail: string, pass: string): Promise<Partial<User>> {

        if (!usernameOrEmail) {
            throw new Error('Username or email is required');
        }
        if (!pass) {
            throw new Error('Password is required');
        }        
        const user: User = await this.findUsersService.findOne(usernameOrEmail);        

        const isPasswordValid = await bcrypt.compare(pass, user.password);        
        
        if (isPasswordValid) {
            const { id, email, username, createdAt } = user;
            const result = { id, username, email, createdAt };

            return result;
        }
        return null;
    }

    async login(user: User) {
        const payload = { useranme: user.email, sub: user._id };

        return { access_token: this.jwtService.sign(payload), }

    }

    public static async hashPassword(
        password: string,
        salt = 10
    ): Promise<string> {
        return await bcrypt.hash(password, salt);
    }

}