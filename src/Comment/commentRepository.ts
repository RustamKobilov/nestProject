import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Comment, CommentDocument } from './Comment';
import { PaginationDTO } from '../DTO';
import { ReactionRepository } from '../Reaction/reactionRepository';
import { mapObject } from '../mapObject';
import { helper } from '../helper';
import { CommentViewModel } from '../viewModelDTO';

Injectable();
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private reactionRepository: ReactionRepository,
  ) {}

  async getComment(id: string): Promise<Comment | false> {
    const comment = await this.commentModel.findOne(
      { id: id },
      { postId: false, _id: false },
    );
    if (!comment) {
      return false;
    }
    return comment;
  }

  async getCommentForUser(
    commentId: string,
    userId: string,
  ): Promise<CommentViewModel | false> {
    const commentForUser = await this.commentModel.findOne(
      { id: commentId },
      { postId: false, _id: false },
    );

    if (!commentForUser) {
      return false;
    }
    const commentUpgrade = await mapObject.mapComment(commentForUser);

    const searchReaction =
      await this.reactionRepository.getReactionUserForParent(commentId, userId);

    if (!searchReaction) {
      return commentUpgrade;
    }

    commentUpgrade.likesInfo.myStatus = searchReaction.status;

    return commentUpgrade;
  }

  async updateComment(id: string, content: string): Promise<boolean> {
    const commentUpdate: UpdateQuery<CommentDocument> =
      await this.commentModel.updateOne(
        { id: id },
        {
          $set: {
            content: content,
          },
        },
      );
    return commentUpdate.matchedCount === 1;
  }

  async deleteComment(commentId: string) {
    return await this.commentModel.deleteOne({ id: commentId });
  }

  async updateCountReactionComment(
    commentId: string,
    countLikes: number,
    countDislike: number,
  ): Promise<boolean> {
    console.log(countLikes);
    console.log(countDislike);
    const updateCountLikeAndDislike: UpdateQuery<CommentDocument> =
      await this.commentModel.updateOne(
        { id: commentId },
        {
          $set: {
            'likesInfo.likesCount': countLikes,
            'likesInfo.dislikesCount': countDislike,
          },
        },
      );
    return updateCountLikeAndDislike.matchedCount === 1;
  }

  async createCommentForPost(newComment: Comment) {
    const createComment = new this.commentModel(newComment);
    await createComment.save();
    return;
  }

  async getCommentsForPost(
    pagination: PaginationDTO,
    filter,
  ) /*: Promise<outputModel<PostViewModel>>*/ {
    const countCommentsForPost = await this.commentModel.countDocuments(filter);
    const paginationFromHelperForComments =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countCommentsForPost,
      );

    const sortCommentsForPosts = await this.commentModel
      .find(filter, {
        postId: false,
        _id: false,
      })
      .sort({ [pagination.sortBy]: pagination.sortDirection })
      .skip(paginationFromHelperForComments.skipPage)
      .limit(pagination.pageSize)
      .lean();

    return {
      pagesCount: paginationFromHelperForComments.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countCommentsForPost,
      items: sortCommentsForPosts,
    };
  }

  async getCommentsForPostUser(
    pagination: PaginationDTO,
    filter,
    userId: string,
  ) {
    const countCommentsForPost = await this.commentModel.countDocuments(filter);
    const paginationFromHelperForComments =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countCommentsForPost,
      );

    const commentsForPosts = await this.commentModel
      .aggregate([
        { $match: filter },
        { $sort: { [pagination.sortBy]: pagination.sortDirection } },
        { $skip: paginationFromHelperForComments.skipPage },
        { $limit: pagination.pageSize },
      ])
      .exec()
      .catch((err) => {
        return err;
      });

    const resultCommentsAddLikes = await Promise.all(
      commentsForPosts.map(async (comment: Comment) => {
        const commentUpgrade = await mapObject.mapComment(comment);
        const searchReaction =
          await this.reactionRepository.getReactionUserForParent(
            commentUpgrade.id,
            userId,
          );
        if (!searchReaction) {
          return commentUpgrade;
        }

        commentUpgrade.likesInfo.myStatus = searchReaction.status;

        return commentUpgrade;
      }),
    );

    return {
      pagesCount: paginationFromHelperForComments.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countCommentsForPost,
      items: resultCommentsAddLikes,
    };
  }
  async updateCommentVision(userId: string, visionStatus: boolean) {
    return true;
  }

  async getCommentsForPostBlogger(pagination: PaginationDTO, param2: {}) {
    return true;
  }
}
