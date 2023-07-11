import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../Post/Comment';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
@Injectable()
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}
  async CreateComment(newComment: Comment) {
    const createComment = new this.commentModel(newComment);
    await createComment.save();
    return;
  }
}
