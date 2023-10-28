export interface RequestData {
  to: string;
  amount: number;
  from: string;
  user: {
    id: string;
    email: string;
  };
}
