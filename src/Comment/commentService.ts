import { CommentRepository } from './commentRepository';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CommentService {
  constructor(private readonly commentRepository: CommentRepository) {}

  async getComment(commentId: string) {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    return comment;
  }
}
