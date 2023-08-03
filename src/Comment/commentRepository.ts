import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateQuery } from 'mongoose';
import { Comment, CommentDocument } from './Comment';
import { OutputCommentType } from '../DTO';
import { User } from '../User/User';
import { ReactionRepository } from '../Like/reactionRepository';
import { mapObject } from '../mapObject';

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
  ): Promise<CommentDocument | OutputCommentType> {
    const commentForUser = await this.commentModel.findOne(
      { id: commentId },
      { postId: false, _id: false },
    );

    if (!commentForUser) {
      throw new NotFoundException('comment not found');
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
    await this.commentModel.deleteOne({ id: commentId });
    return;
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
}
