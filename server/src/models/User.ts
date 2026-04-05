import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  userId: string;
  username: string;
  position: { x: number; y: number };
  color: string;
  lastActive: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  position: {
    x: { type: Number, default: 400 },
    y: { type: Number, default: 300 },
  },
  color: { type: String, required: true },
  lastActive: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

export const User = mongoose.model<IUser>('User', UserSchema);
