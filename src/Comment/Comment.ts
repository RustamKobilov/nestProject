import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { likeStatus } from '../Enum';

export type CommentatorInfoDocument = HydratedDocument<CommentatorInfo>;
@Schema({ _id: false, versionKey: false })
export class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  userLogin: string;
}
export const CommentatorInfoSchema =
  SchemaFactory.createForClass(CommentatorInfo);

export type LikesInfoDocument = HydratedDocument<LikesInfo>;
@Schema({ _id: false, versionKey: false })
export class LikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number;
  @Prop({ type: Number, required: true })
  dislikesCount: number;
  @Prop({ type: String, enum: likeStatus, required: true })
  myStatus: likeStatus;
}
export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);

export type CommentDocument = HydratedDocument<Comment>;
@Schema({ versionKey: false })
export class Comment {
  @Prop({ type: String, required: true })
  postId: string;
  @Prop({ type: String, unique: true, required: true })
  id: string;
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;
  @Prop({ type: String, required: true })
  createdAt: string;
  @Prop({ type: LikesInfoSchema, required: true })
  likesInfo: LikesInfo;
  @Prop({ type: Boolean, required: true })
  vision: boolean;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
