import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { likeStatus } from '../Enum';
import { HydratedDocument } from 'mongoose';

export type ReactionDocument = HydratedDocument<Reaction>;
@Schema({ versionKey: false })
export class Reaction {
  @Prop({ type: String, required: true })
  parentId: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
  @Prop({ type: String, required: true })
  status: likeStatus;
  @Prop({ type: String, required: true })
  createdAt: string;
}
export const ReactionSchema = SchemaFactory.createForClass(Reaction);
