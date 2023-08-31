import { CommentRepository } from './commentRepository';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { User } from '../User/User';
import { likeStatus } from '../Enum';
import { ReactionRepository } from '../Like/reactionRepository';
import { randomUUID } from 'crypto';
import { Comment, CommentatorInfo, LikesInfo } from './Comment';
import { mapObject } from '../mapObject';
import { CommentViewModel } from '../viewModelDTO';
import { PaginationDTO } from '../DTO';
import { helper } from '../helper';

@Injectable()
export class CommentService {
  constructor(
    private readonly commentRepository: CommentRepository,
    private readonly reactionRepository: ReactionRepository,
  ) {}

  async getComment(commentId: string) {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new BadRequestException(
        'commentId not found for comment /commentService',
      );
    }
    return comment;
  }

  async getCommentOnIdForUser(id: string, userId: string) {
    const comment = await this.commentRepository.getCommentForUser(id, userId);
    if (!comment) {
      throw new BadRequestException(
        'commentId not found for comment /commentService',
      );
    }
    return comment;
  }

  async createCommentForPost(postId: string, content: string, user: User) {
    const idNewComment = randomUUID();
    const commentatorInfoNewComment: CommentatorInfo = {
      userId: user.id,
      userLogin: user.login,
    };
    const commentLikesInfo: LikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      myStatus: likeStatus.None,
    };

    const newComment: Comment = {
      postId: postId,
      id: idNewComment,
      content: content,
      commentatorInfo: commentatorInfoNewComment,
      createdAt: new Date().toISOString(),
      likesInfo: commentLikesInfo,
    };
    console.log(newComment);
    await this.commentRepository.createCommentForPost(newComment);
    return idNewComment;
  }

  async updateCommentOnId(commentId: string, content: string, userId: string) {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException('ne svoi comment /commentService');
    }
    const updateResult = await this.commentRepository.updateComment(
      commentId,
      content,
    );
    if (!updateResult) {
      throw new NotFoundException('comment no update /commentService');
    }
    return;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException('ne svoi comment /commentService');
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
      throw new NotFoundException(
        'commentId not found for comment /commentService',
      );
    }
    const updateReaction = await this.reactionRepository.getCountLikeStatusUser(
      comment.id,
      user,
      likeStatus,
    );

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

  async getCommentViewModel(commentId: string): Promise<CommentViewModel> {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new BadRequestException(
        'commentId not found for comment /commentService',
      );
    }
    const commentViewModel = mapObject.mapComment(comment);
    return commentViewModel;
  }

  async getComments(
    getPagination: PaginationDTO,
    postId: string,
  ) /*: Promise<outputModel<PostViewModel>>*/ {
    const filter = { postId: postId };
    const pagination = helper.getCommentPaginationValues(getPagination);
    return await this.commentRepository.getCommentsForPost(pagination, filter);
  }

  async getCommentsForUser(
    getPagination: PaginationDTO,
    postId: string,
    userId: string,
  ) {
    const filter = { postId: postId };
    const pagination = helper.getCommentPaginationValues(getPagination);
    return await this.commentRepository.getCommentsForPostUser(
      pagination,
      filter,
      userId,
    );
  }
}
