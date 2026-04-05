import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    userId: string;
    username: string;
    position: {
        x: number;
        y: number;
    };
    color: string;
    lastActive: Date;
    createdAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, {}> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=User.d.ts.map