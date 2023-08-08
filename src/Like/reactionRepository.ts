import { Injectable } from '@nestjs/common';
import { Reaction, ReactionDocument } from './Reaction';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { likeStatus } from '../Enum';
import { User } from '../User/User';
import { CommentRepository } from '../Comment/commentRepository';

Injectable();
export class ReactionRepository {
  constructor(
    @InjectModel(Reaction.name)
    private reactionModel: Model<ReactionDocument>,
  ) {}
  private createReaction(
    parentId: string,
    userId: string,
    userLogin: string,
    status: likeStatus,
  ): Reaction {
    return {
      parentId,
      userId,
      userLogin,
      status,
      createdAt: new Date().toISOString(),
    };
  }
  async getReactionUserForParent(
    parentId: string,
    userId: string,
  ): Promise<Reaction | null> {
    const reaction = await this.reactionModel.findOne(
      { parentId: parentId, userId: userId } /*,{'status':1}*/,
    );
    return reaction;
  }
  async getCountLikeStatusUser(
    commentId: string,
    user: User,
    likeStatusUpdate: likeStatus,
  ) {
    //TODO как передать в метод enum
    const newReaction: Reaction = this.createReaction(
      commentId,
      user.id,
      user.login,
      likeStatusUpdate,
    );
    const findReaction = await this.reactionModel.findOne({
      parentId: commentId,
    });

    const updateReaction = await this.reactionModel.updateOne(
      { parentId: commentId, userId: newReaction.userId },
      { $set: { ...newReaction } },
      { upsert: true },
    );

    const likesCount = await this.reactionModel.countDocuments({
      parentId: commentId,
      status: likeStatus.Like,
    });

    const dislikesCount = await this.reactionModel.countDocuments({
      parentId: commentId,
      status: likeStatus.Dislike,
    });
    return { likesCount: likesCount, dislikesCount: dislikesCount };
  }
}
