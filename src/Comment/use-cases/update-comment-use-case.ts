import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../commentRepository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

export class UpdateCommentUseCaseCommand {
  constructor(
    public commentId: string,
    public content: string,
    public userId: string,
  ) {}
}
@CommandHandler(UpdateCommentUseCaseCommand)
export class UpdateCommentUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: UpdateCommentUseCaseCommand) {
    const comment = await this.commentRepository.getComment(command.commentId);
    if (!comment) {
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    if (comment.commentatorInfo.userId !== command.userId) {
      throw new ForbiddenException('ne svoi comment /commentService');
    }
    const updateResult = await this.commentRepository.updateComment(
      command.commentId,
      command.content,
    );
    if (!updateResult) {
      throw new NotFoundException('comment no update /commentService');
    }
    return;
  }
}
