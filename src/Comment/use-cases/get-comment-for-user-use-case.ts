import { CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { CommentRepository } from '../commentRepository';
import { CommentViewModel } from '../../viewModelDTO';

export class GetCommentForUserUseCaseCommand {
  constructor(public commentId: string, public userId: string) {}
}
@CommandHandler(GetCommentForUserUseCaseCommand)
export class GetCommentForUserUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(
    command: GetCommentForUserUseCaseCommand,
  ): Promise<CommentViewModel> {
    const comment = await this.commentRepository.getCommentForUser(
      command.commentId,
      command.userId,
    );
    if (!comment) {
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    return comment;
  }
}
