import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { likeStatus } from '../Enum';

@Schema({ _id: false, versionKey: false })
export class NewestLikes {
  @Prop({ type: String, required: true })
  addedAt: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  login: string;
}
export const NewestLikesSchema = SchemaFactory.createForClass(NewestLikes);
@Schema({ _id: false, versionKey: false })
export class ExtendedLikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number;
  @Prop({ type: Number, required: true })
  dislikesCount: number;
  @Prop({ type: String, enum: likeStatus, required: true })
  myStatus: likeStatus;
  @Prop({ type: [NewestLikesSchema], required: true })
  newestLikes: NewestLikes[];
}
export const ExtendedLikesInfoSchema =
  SchemaFactory.createForClass(ExtendedLikesInfo);

export type PostDocument = HydratedDocument<Post>;
@Schema({ versionKey: false })
export class Post {
  @Prop({ type: String, unique: true, required: true })
  id: string;
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  title: string;
  @Prop({ type: String, required: true })
  shortDescription: string;
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: String, required: true })
  blogId: string;
  @Prop({ type: String, required: true })
  blogName: string;
  @Prop({ type: String, required: true })
  createdAt: string;
  @Prop({ type: ExtendedLikesInfoSchema, required: true })
  extendedLikesInfo: ExtendedLikesInfo;
  @Prop({ type: Boolean, required: true })
  vision: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);
