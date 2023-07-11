import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LikeStatus } from '../../viewModelDTO';

@Schema({ versionKey: false })
export class LikesInfo {
  @Prop({ type: Number, required: true })
  likesCount: number;
  @Prop({ type: Number, required: true })
  dislikesCount: number;
  @Prop({ type: String, enum: LikeStatus, required: true })
  myStatus: string;
}
export const LikesInfoSchema = SchemaFactory.createForClass(LikesInfo);
