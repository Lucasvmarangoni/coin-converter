export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
}

export interface UserResponseWithPassword extends UserResponse {
  password: string | undefined;
}
