import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type AttemptDocument = HydratedDocument<Attempt>;

@Schema({ versionKey: false })
export class Attempt {
  @Prop({ type: String, required: true })
  endpointName: string;
  @Prop({ type: String, required: true })
  ip: string;

  @Prop({ type: String, required: true })
  dateAttempt: string;
}
export const AttemptSchema = SchemaFactory.createForClass(Attempt);
