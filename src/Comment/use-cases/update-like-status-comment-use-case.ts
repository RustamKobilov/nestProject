import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../commentRepository';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../User/User';
import { likeStatus } from '../../Enum';
import { ReactionRepository } from '../../Like/reactionRepository';

export class UpdateLikeStatusCommentUseCaseCommand {
  constructor(
    public commentId: string,
    public likeStatus: likeStatus,
    public user: User,
  ) {}
}
@CommandHandler(UpdateLikeStatusCommentUseCaseCommand)
export class UpdateLikeStatusCommentUseCase {
  constructor(
    private commentRepository: CommentRepository,
    private reactionRepository: ReactionRepository,
  ) {}

  async execute(command: UpdateLikeStatusCommentUseCaseCommand) {
    const comment = await this.commentRepository.getComment(command.commentId);
    if (!comment) {
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    console.log(comment);
    const updateReaction = await this.reactionRepository.getCountLikeStatusUser(
      comment.id,
      command.user,
      command.likeStatus,
    );
    console.log(await updateReaction);
    if (!updateReaction) {
      throw new NotFoundException(
        'comment ne obnovilsya, CommentService ,update',
      );
    }
    const updateCountLike =
      await this.commentRepository.updateCountReactionComment(
        comment.id,
        updateReaction.likesCount,
        updateReaction.dislikesCount,
      );
    if (!updateCountLike) {
      throw new NotFoundException('no update reaction /commentService');
    }
    return;
  }
}
