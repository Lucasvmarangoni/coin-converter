import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

export interface ConversionRates {
  [key: string]: number;
}

export type TransactionDocument = Transaction & Document;

@Schema({
  toJSON: {
    transform: (_, ret): void => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})
export class Transaction extends Document {
  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  // user: string;

  @Prop({ type: String, required: true })
  from: string;

  @Prop({ type: String, required: true })
  amount: number;

  @Prop({ type: Array, required: true, })
  to: string[];

  @Prop({ type: Object, required: true })
  rates: ConversionRates;

  @Prop({ type: Date, required: true })
  date: Date;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

export const Transactions = mongoose.model<TransactionDocument>(
  'Transactions',
  TransactionSchema,
);
