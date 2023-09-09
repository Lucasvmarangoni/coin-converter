export type Rate = { [key: string]: number };

export interface ConvertProps {
  rates: Rate;
}
export interface ResponseData {
  user?: string;
  from: string;
  amount: number;
  to: string | string[];
  rates: Rate;
  date: Date;
}
export interface RequestData {
  to: string;
  amount: number;
  from: string;
  user: string;
}
