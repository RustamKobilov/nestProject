import { CommentRepository } from './commentRepository';
import { NotFoundException } from '@nestjs/common';
import { User } from '../User/User';
import { likeStatus } from '../Enum';
import { ReactionRepository } from '../Like/reactionRepository';

export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly reactionRepository: ReactionRepository,
  ) {}

  async getComment(commentId: string) {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    return comment;
  }

  async getCommentOnIdForUser(id: string, user: User) {
    return this.commentRepository.getCommentForUser(id, user);
  }

  async updateCommentOnId(id: string, content: string) {
    const updateResult = await this.commentRepository.updateComment(
      id,
      content,
    );
    if (!updateResult) {
      throw new NotFoundException(
        'comment ne obnovilsya, CommentService ,update',
      );
    }
    return;
  }

  async deleteComment(commentId: string) {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException('comment not found CommentService ,delete');
    }
    return await this.commentRepository.deleteComment(commentId);
  }

  async updateLikeStatusComment(
    commentId: string,
    likeStatus: likeStatus,
    user: User,
  ) {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException('comment not found CommentService ,delete');
    }
    const updateResult =
      await this.reactionRepository.changeCountLikeStatusUser(
        comment.id,
        user,
        likeStatus,
      );

    if (!updateResult) {
      throw new NotFoundException(
        'comment ne obnovilsya, CommentService ,update',
      );
    }
    return;
  }
}
