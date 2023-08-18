import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';


@Injectable()
export class FindUsersService {

  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>) { }

  async findOne(usernameOrEmail: string): Promise<User | undefined> {
    let user: User;   
    
    if (this.isEmail(usernameOrEmail)) {        
      user = await this.userModel.findOne<User>({ email: usernameOrEmail })
    }
    user =  await this.userModel.findOne<User>({ username: usernameOrEmail });   
    
    return user;
  }

  isEmail(email: string) {
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexEmail.test(email);
  }
}