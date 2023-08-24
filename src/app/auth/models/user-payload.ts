export interface UserPayload {
  sub: string;
  name: string;
  username: string;
  email: string;
  iat?: number;
  exp?: number;
}
