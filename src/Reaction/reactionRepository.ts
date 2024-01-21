import { Injectable } from '@nestjs/common';
import { Reaction, ReactionDocument } from './Reaction';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { likeStatus } from '../Enum';
import { User } from '../User/User';
import { CommentRepository } from '../Comment/commentRepository';
import { mapObject } from '../mapObject';

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
      vision: true,
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
    parentId: string,
    user: User,
    likeStatusUpdate: likeStatus,
  ) {
    const newReaction: Reaction = this.createReaction(
      parentId,
      user.id,
      user.login,
      likeStatusUpdate,
    );

    const updateReaction = await this.reactionModel.updateOne(
      { parentId: parentId, userId: newReaction.userId },
      { $set: { ...newReaction } },
      { upsert: true },
    );

    const likesCount = await this.reactionModel.countDocuments({
      parentId: parentId,
      status: likeStatus.Like,
    });

    const dislikesCount = await this.reactionModel.countDocuments({
      parentId: parentId,
      status: likeStatus.Dislike,
    });

    const lastReactionUser = await this.reactionModel
      .aggregate([
        { $match: { parentId: parentId, status: likeStatus.Like } },
        { $sort: { createdAt: -1 } },
        { $limit: 3 },
      ])
      .exec()
      .catch((err) => {
        return err;
      });

    const lastlikeUser = await Promise.all(
      lastReactionUser.map(async (reaction: Reaction) => {
        const newestLikes = await mapObject.mapNewestLikes(reaction);
        return newestLikes;
      }),
    );
    return {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      lastLikeUser: lastlikeUser,
    };
  }
  async getCountReactionAndLastLikeStatusUser(parentId: string) {
    return {
      likesCount: 1,
      dislikesCount: 1,
      lastLikeUser: [
        {
          addedAt: 'sqlReaction.createdAt',
          userId: 'sqlReaction.userId',
          login: 'sqlReaction.userLogin',
        },
      ],
    };
  }
  async getAllParentInAddReactionBanUser(userId: string) {
    return ['getAllParentInAddReactionBanUser'];
  }

  async updateReactionVision(userId: string, visionStatus: boolean) {
    return;
  }
}
