import { CommentRepository } from './commentRepository';
import { Injectable, NotFoundException } from '@nestjs/common';
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
      throw new NotFoundException('comment not found');
    }
    return comment;
  }

  async getCommentOnIdForUser(id: string, user: User) {
    return this.commentRepository.getCommentForUser(id, user);
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
      throw new NotFoundException('no update reaction');
    }
    return;
  }

  async getCommentViewModel(commentId: string): Promise<CommentViewModel> {
    const comment = await this.commentRepository.getComment(commentId);
    if (!comment) {
      throw new NotFoundException('comment not found');
    }
    const commentViewModel = mapObject.mapComment(comment);
    return commentViewModel;
  }

  async getCommentsForPost(
    getPagination: PaginationDTO,
    postId: string,
  ) /*: Promise<outputModel<PostViewModel>>*/ {
    const filter = { postId: postId };
    const pagination = helper.getCommentPaginationValues(getPagination);
    return await this.commentRepository.getCommentsForPost(pagination, filter);
  }

  async getCommentsForPostUser(
    getPagination: PaginationDTO,
    postId: string,
    userId: string,
  ) {
    const pagination = helper.getCommentPaginationValues(getPagination);
    return await this.getCommentsForPostUser(pagination, postId, userId);
  }
}
