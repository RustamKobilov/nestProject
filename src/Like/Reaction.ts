import { Prop, Schema } from '@nestjs/mongoose';
import { likeStatus } from '../Enum';

@Schema({ versionKey: false })
export class Reaction {
  @Prop({ type: String, unique: true, required: true })
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
