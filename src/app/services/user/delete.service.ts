import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';


@Injectable()
export class DeleteAllUsersService {

  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>) { }

  async execute(): Promise<void> {  
    
     await this.userModel.deleteMany({});     
 
  }

  isEmail(email: string) {
    const regex = /^(([^<>()[]\.,;:\s@"]+(.[^<>()[]\.,;:\s@"]+)*)|(".+"))@(([[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}.[0-9]{1,3}])|(([a-zA-Z-0-9]+.)+[a-zA-Z]{2,}))$/;
    return regex.test(email);
  }
}