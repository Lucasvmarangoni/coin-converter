import { User } from '@src/app/models/user';
import { Request } from 'express';

export interface AuthRequest extends Request {
  user: User;
}
