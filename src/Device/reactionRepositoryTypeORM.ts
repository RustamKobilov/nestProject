import { InjectRepository } from '@nestjs/typeorm';
import { DeviceEntity } from './Device.Entity';
import { Repository } from 'typeorm';
import { ReactionEntity } from '../Like/Reaction.Entity';
import { likeStatus } from '../Enum';
import { Reaction } from '../Like/Reaction';
import { mapObject } from '../mapObject';
import { User } from '../User/User';
import { ta } from 'date-fns/locale';
import { PostEntity } from '../Post/Post.Entity';

export class ReactionRepositoryTypeORM {
  constructor(
    @InjectRepository(ReactionEntity)
    private readonly reactionRepositoryTypeOrm: Repository<ReactionEntity>,
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
  ): Promise<Reaction | false> {
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    const take = await qbReaction
      .where('r.userId = :userId AND r.parentId = :parentId', {
        userId: userId,
        parentId: parentId,
      })
      .getRawMany();
    if (take.length < 1) {
      return false;
    }
    const reactionsRaw = mapObject.mapRawManyQBOnTableName(take, ['r' + '_']);
    const reactions = mapObject.mapReactionFromSql(reactionsRaw);
    console.log(reactions);
    return reactions[0];
  }

  async getCountLikeStatusUser(
    parentId: string,
    user: User,
    likeStatusUpdate: likeStatus,
  ) {
    const newReaction: Reaction = await this.createReaction(
      parentId,
      user.id,
      user.login,
      likeStatusUpdate,
    );

    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    const take = await qbReaction
      .where('r.userId = :userId AND r.parentId = :parentId', {
        userId: newReaction.userId,
        parentId: parentId,
      })
      .getRawMany();

    if (take.length < 1) {
      console.log('novyi');
      const reactionCreate = await this.reactionRepositoryTypeOrm.save({
        parentId: parentId,
        userId: newReaction.userId,
        userLogin: newReaction.userLogin,
        status: newReaction.status,
        createdAt: newReaction.createdAt,
      });
    } else {
      console.log('staryi');
      //TODO ошибка типа

      const update = await qbReaction
        .update(ReactionEntity)
        .set({
          userLogin: newReaction.userLogin,
          status: newReaction.status,
          createdAt: newReaction.createdAt,
        })
        .where('r.userId = :userId AND r.parentId = :parentId', {
          userId: newReaction.userId,
          parentId: parentId,
        })
        .execute();

      const likesCount = await qbReaction
        .where('r.status = :status AND r.parentId = :parentId', {
          status: likeStatus.Like,
          parentId: parentId,
        })
        .getCount();

      const dislikesCount = await qbReaction
        .where('r.status = :status AND r.parentId = :parentId', {
          status: likeStatus.Dislike,
          parentId: parentId,
        })
        .getCount();

      const limitLike = 3;
      const tableNewestLike = await qbReaction
        .where('r.parentId = :parentId AND r.status = :status', {
          parentId: parentId,
          status: likeStatus.Like,
        })
        .orderBy('r.' + 'createdAt', 'DESC')
        .take(limitLike)
        .getRawMany();

      const newestLike = mapObject.mapRawManyQBOnTableName(tableNewestLike, [
        'r' + '_',
      ]);

      const lastlikeUser = mapObject.mapNewestLikesFromSql(newestLike);
      console.log('imenno tyt');
      console.log(likesCount);
      console.log(dislikesCount);
      return {
        likesCount: likesCount,
        dislikesCount: dislikesCount,
        lastLikeUser: lastlikeUser,
      };
    }
  }
}
