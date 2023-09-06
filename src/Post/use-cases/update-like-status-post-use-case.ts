import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../postRepository';
import { NotFoundException } from '@nestjs/common';
import { User } from '../../User/User';
import { likeStatus } from '../../Enum';
import { ReactionRepository } from '../../Like/reactionRepository';

export class UpdateLikeStatusPostUseCaseCommand {
  constructor(
    public postId: string,
    public likeStatus: likeStatus,
    public user: User,
  ) {}
}

@CommandHandler(UpdateLikeStatusPostUseCaseCommand)
export class UpdateLikeStatusPostUseCase {
  constructor(
    private postRepository: PostRepository,
    private reactionRepository: ReactionRepository,
  ) {}

  async execute(command: UpdateLikeStatusPostUseCaseCommand) {
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    const updateReaction = await this.reactionRepository.getCountLikeStatusUser(
      post.id,
      command.user,
      command.likeStatus,
    );

    if (!updateReaction) {
      throw new NotFoundException(
        'comment ne obnovilsya, CommentService ,update',
      );
    }
    const updateCountLike = await this.postRepository.updateCountReactionPost(
      post.id,
      updateReaction.likesCount,
      updateReaction.dislikesCount,
      updateReaction.lastLikeUser,
    );
    if (!updateCountLike) {
      throw new NotFoundException('no update reaction /postService');
    }
    return;
  }
}
