import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../commentRepository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class DeleteCommentUseCaseCommand {
  constructor(public commentId: string, public userId: string) {}
}
@CommandHandler(DeleteCommentUseCaseCommand)
export class DeleteCommentUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: DeleteCommentUseCaseCommand) {
    const comment = await this.commentRepository.getComment(command.commentId);
    if (!comment) {
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    if (comment.commentatorInfo.userId !== command.userId) {
      throw new ForbiddenException('ne svoi comment /commentService');
    }
    return await this.commentRepository.deleteComment(command.commentId);
  }
}
