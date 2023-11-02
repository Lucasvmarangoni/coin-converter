interface UserProps {
  name: string;
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

export class UserUpdatedEvent {
  constructor(readonly currentEmail: string, readonly user: UserProps) {}
}
