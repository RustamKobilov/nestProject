import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Comment, CommentDocument } from './Comment';
import { OutputCommentType, PaginationDTO } from '../DTO';
import { User } from '../User/User';
import { ReactionRepository } from '../Like/reactionRepository';
import { mapObject } from '../mapObject';
import { helper } from '../helper';

Injectable();
export class CommentRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    private reactionRepository: ReactionRepository,
  ) {}

  async getComment(id: string): Promise<Comment | null> {
    return this.commentModel.findOne({ id: id }, { postId: false, _id: false });
  }

  async getCommentForUser(
    commentId: string,
    user: User,
  ): Promise<CommentDocument | OutputCommentType | false> {
    const commentForUser = await this.commentModel.findOne(
      { id: commentId },
      { postId: false, _id: false },
    );

    if (!commentForUser) {
      return false;
    }
    const searchReaction =
      await this.reactionRepository.getReactionUserForParent(
        commentId,
        user.id,
      );

    if (!searchReaction) {
      return commentForUser;
    }

    const commentUpgrade = await mapObject.mapComment(commentForUser);

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
  ) /*: Promise<outputModel<CommentViewModel>>*/ {
    const countCommentsForPost = await this.commentModel.countDocuments(filter);
    const paginationFromHelperForComments =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countCommentsForPost,
      );

    const sortCommentsForPosts = await this.commentModel
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

    //    const sortCommentsForPosts = await this.commentModel
    //       .find(filter, {
    //         postId: false,
    //         _id: false,
    //       })
    //       .sort({ [pagination.sortBy]: pagination.sortDirection })
    //       .skip(paginationFromHelperForComments.skipPage)
    //       .limit(pagination.pageSize)
    //       .lean();
    //TODO 2 errorrs typy method , agregate может быть
    const resultCommentsAddLikes = await Promise.all(
      sortCommentsForPosts.map(async (comment: Comment) => {
        const commentUpgrade = await mapObject.mapComment(comment);
        const searchReaction =
          await this.reactionRepository.getReactionUserForParent(
            commentUpgrade.id,
            userId,
          );
        if (!searchReaction) {
          return comment;
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
}
