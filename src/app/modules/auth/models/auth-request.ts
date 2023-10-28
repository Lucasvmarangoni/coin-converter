import { Request } from 'express';
import { UserFromJwt } from './user-from-jwt';

export interface AuthRequest extends Request {
  user: UserFromJwt;
}
