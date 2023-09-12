import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '@src/app/models/user';
import { Model } from 'mongoose';

@Injectable()
export class DeleteService {
  constructor(
    @InjectModel('UserModel')
    private userModel: Model<User>,
  ) {}

  async execute(user: User): Promise<void> {
    await this.userModel.deleteOne({ id: user.id });
  }
}
