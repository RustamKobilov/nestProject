import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DeviceDocument = HydratedDocument<Device>;
@Schema({ versionKey: false })
export class Device {
  @Prop({ type: String, unique: true, required: true })
  deviceId: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  lastActiveDate: string;
  @Prop({ type: String, required: true })
  diesAtDate: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  ip: string;
}
export const DeviceSchema = SchemaFactory.createForClass(Device);
