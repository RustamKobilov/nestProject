import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../Comment/commentRepository';
import { User } from '../../User/User';
import { randomUUID } from 'crypto';
import { Comment, CommentatorInfo, LikesInfo } from '../../Comment/Comment';
import { likeStatus } from '../../Enum';
import { ParentRepositoryTypeORM } from '../../ParentBanList/parentRepositoryTypeORM';
import {
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';

export class CreateCommentForPostUseCaseCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public content: string,
    public user: User,
  ) {}
}
@CommandHandler(CreateCommentForPostUseCaseCommand)
export class CreateCommentForPostUseCase {
  constructor(
    private commentRepository: CommentRepository,
    private parentRepositoryTypeORM: ParentRepositoryTypeORM,
  ) {}

  async execute(command: CreateCommentForPostUseCaseCommand) {
    //
    const checkUserBanned =
      await this.parentRepositoryTypeORM.findBanUserAndParentInParentBanList(
        command.blogId,
        command.user.id,
      );

    if (checkUserBanned) {
      throw new ForbiddenException('user zabanen/CreateCommentForPostUseCase');
    }
    const checkBlogBanned =
      await this.parentRepositoryTypeORM.findBanUserInParentBanList(
        command.blogId,
      );

    if (checkBlogBanned) {
      throw new BadRequestException(
        'blog zabanen. kak comment create? /CreateCommentForPostUseCase',
      );
    }

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
      vision: true,
    };
    console.log(newComment);
    await this.commentRepository.createCommentForPost(newComment);
    return idNewComment;
  }
}
