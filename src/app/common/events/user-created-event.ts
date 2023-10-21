interface UserProps {
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export class UserCreatedEvent {
  constructor(readonly user: UserProps) {}
}
