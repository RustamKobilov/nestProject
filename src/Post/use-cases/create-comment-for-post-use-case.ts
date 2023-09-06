import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../Comment/commentRepository';
import { User } from '../../User/User';
import { randomUUID } from 'crypto';
import { Comment, CommentatorInfo, LikesInfo } from '../../Comment/Comment';
import { likeStatus } from '../../Enum';

export class CreateCommentForPostUseCaseCommand {
  constructor(
    public postId: string,
    public content: string,
    public user: User,
  ) {}
}
@CommandHandler(CreateCommentForPostUseCaseCommand)
export class CreateCommentForPostUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: CreateCommentForPostUseCaseCommand) {
    const idNewComment = randomUUID();
    const commentatorInfoNewComment: CommentatorInfo = {
      userId: command.user.id,
      userLogin: command.user.login,
    };
    const commentLikesInfo: LikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };

    const newComment: Comment = {
      postId: command.postId,
      id: idNewComment,
      content: command.content,
      commentatorInfo: commentatorInfoNewComment,
      createdAt: new Date().toISOString(),
      likesInfo: commentLikesInfo,
    };
    console.log(newComment);
    await this.commentRepository.createCommentForPost(newComment);
    return idNewComment;
  }
}
