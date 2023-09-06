import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../commentRepository';
import { BadRequestException } from '@nestjs/common';
import { mapObject } from '../../mapObject';
import { CommentViewModel } from '../../viewModelDTO';

export class GetCommentViewModelUseCaseCommand {
  constructor(public commentId: string) {}
}
@CommandHandler(GetCommentViewModelUseCaseCommand)
export class GetCommentViewModelUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(
    command: GetCommentViewModelUseCaseCommand,
  ): Promise<CommentViewModel> {
    const comment = await this.commentRepository.getComment(command.commentId);
    if (!comment) {
      throw new BadRequestException(
        'commentId not found for comment /commentService',
      );
    }
    const commentViewModel = mapObject.mapComment(comment);
    return commentViewModel;
  }
}
