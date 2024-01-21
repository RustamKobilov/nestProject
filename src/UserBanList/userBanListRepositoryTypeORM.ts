import { InjectRepository } from '@nestjs/typeorm';
import { UserBanListEntity } from './UserBanList.Entity';
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { ReactionRepository } from '../Reaction/reactionRepository';
import { CommentRepository } from '../Comment/commentRepository';
import { PostRepository } from '../Post/postRepository';

@Injectable()
export class UserBanListRepositoryTypeORM {
  constructor(
    @InjectRepository(UserBanListEntity)
    private userBanListRepository: Repository<UserBanListEntity>,
    private commentRepository: CommentRepository,
    private postRepository: PostRepository,
    private reactionRepository: ReactionRepository,
  ) {}
  async addUserInBanList(userId: string, banReason: string, isBanned: boolean) {
    const userAddBanList = await this.userBanListRepository.save(<
      UserBanListEntity
    >{
      dateBan: new Date().toISOString(),
      id: userId,
      banReason: banReason,
    });
    await this.updateVisionStatusForParentByUserId(userId, isBanned);
    return;
  }
  //TODO в обоих случаях теперь должен быть set, првоерить логику . еще раз после того, как обязательно создаем лист
  async deleteUserInBanList(userId: string, isBanned: boolean) {
    const qbUserBanList = await this.userBanListRepository.createQueryBuilder(
      'uBL',
    );
    const deleteOperation = await qbUserBanList
      .delete()
      .where('id = :id', { id: userId })
      .execute();
    if (deleteOperation.affected !== 1) {
      return false;
    }
    await this.updateVisionStatusForParentByUserId(userId, isBanned);
    return true;
  }
  public async updateVisionStatusForParentByUserId(
    userId: string,
    visionStatus: boolean,
  ) {
    await this.postRepository.updatePostVision(userId, visionStatus);
    await this.commentRepository.updateCommentVision(userId, visionStatus);
    await this.reactionRepository.updateReactionVision(userId, visionStatus);
    const arrayParentForUserBanned =
      await this.reactionRepository.getAllParentInAddReactionBanUser(userId);
    for (const parentId of arrayParentForUserBanned) {
      const countLikeAndDislikeLastReaction =
        await this.reactionRepository.getCountReactionAndLastLikeStatusUser(
          parentId,
        );
      console.log(countLikeAndDislikeLastReaction);
      const resultUpdateComment =
        await this.commentRepository.updateCountReactionComment(
          parentId,
          countLikeAndDislikeLastReaction.likesCount,
          countLikeAndDislikeLastReaction.dislikesCount,
        );
      console.log(resultUpdateComment + ' comment ' + parentId);
      if (!resultUpdateComment) {
        const resultUpdatePost =
          await this.postRepository.updateCountReactionPost(
            parentId,
            countLikeAndDislikeLastReaction.likesCount,
            countLikeAndDislikeLastReaction.dislikesCount,
            countLikeAndDislikeLastReaction.lastLikeUser,
          );
        console.log(resultUpdatePost + ' post ' + parentId);
      }
    }
    return;
  }
}
