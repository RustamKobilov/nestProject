import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ _id: false, versionKey: false })
export class UserConfirmationInfo {
  @Prop({ type: Boolean, required: true })
  userConformation: boolean;
  @Prop({ type: String, required: true })
  code: string;
  @Prop({ type: String, required: true })
  expirationCode: string;
}
export const UserConfirmationInfoSchema =
  SchemaFactory.createForClass(UserConfirmationInfo);

@Schema({ _id: false, versionKey: false })
export class UserRecoveryPasswordInfo {
  @Prop({ type: String, required: true })
  recoveryCode: string;
  @Prop({ type: String, required: true })
  diesAtDate: string;
}
export const UserRecoveryPasswordInfoSchema = SchemaFactory.createForClass(
  UserRecoveryPasswordInfo,
);

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true, type: String })
  id: string;
  @Prop({ required: true, unique: true, type: String })
  login: string;
  @Prop({ required: true, type: String })
  password: string;
  @Prop({ required: true, unique: true, type: String })
  email: string;
  @Prop({ required: true, type: String })
  createdAt: string;
  @Prop({ required: true, type: String })
  salt: string;

  @Prop({ required: true, type: UserConfirmationInfoSchema })
  userConfirmationInfo: UserConfirmationInfo;
  @Prop({ required: true, type: UserRecoveryPasswordInfoSchema })
  recoveryPasswordInfo: UserRecoveryPasswordInfo;
}

export const UserSchema = SchemaFactory.createForClass(User);
