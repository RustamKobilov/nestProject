import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikesInfo, LikesInfoSchema } from './LikesInfo/LikesInfo';

@Schema({ versionKey: false })
export class CommentatorInfo {
  @Prop({ type: String, required: true })
  userId: string;
  @Prop({ type: String, required: true })
  userLogin: string;
}
export const CommentInfoSchema = SchemaFactory.createForClass(CommentatorInfo);

@Schema({ versionKey: false })
export class Comment {
  @Prop({ type: String, unique: true, required: true })
  id: string;
  @Prop({ type: String, required: true })
  postId: string;
  @Prop({ type: String, required: true })
  content: string;
  @Prop({ type: CommentInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: true })
  createdAt: string;
  @Prop({ type: LikesInfoSchema, required: true })
  likesInfo: LikesInfo;
}

export const CommentSchema = SchemaFactory.createForClass(Comment);
