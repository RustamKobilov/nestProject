import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ versionKey: false })
export class Blog {
  @Prop({ type: String, unique: true, required: true })
  id: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
  @Prop({ type: String, required: true })
  name: string;
  @Prop({ type: String, required: true })
  description: string;
  @Prop({ type: String, required: true })
  websiteUrl: string;
  @Prop({ type: String, required: true })
  createdAt: string;
  @Prop({ type: Boolean, required: true })
  isMembership: boolean;
  @Prop({ type: Boolean, required: true })
  vision: boolean;
  @Prop({ type: String, required: true, default: null })
  createdAtVision;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
