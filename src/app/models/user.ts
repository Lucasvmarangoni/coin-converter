import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
export type UserDocument = User & Document;

@Schema({
  toJSON: {
    transform: (_, ret): void => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    },
  },
})

export class User extends Document {

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true, unique: true })
  username: string;

  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({ type: Date, required: true })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export const Users = mongoose.model<UserDocument>(
  'Users',
  UserSchema,
);

