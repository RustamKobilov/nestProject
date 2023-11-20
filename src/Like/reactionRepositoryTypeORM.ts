import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactionEntity } from './Reaction.Entity';
import { likeStatus } from '../Enum';
import { Reaction } from './Reaction';
import { mapObject } from '../mapObject';
import { User } from '../User/User';

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
    console.log('take search');
    console.log(take);

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
        .where('userId = :userId AND parentId = :parentId', {
          userId: newReaction.userId,
          parentId: parentId,
        })
        .execute();
      console.log('affected');
      console.log(update.affected);
    }
    //TODO почему qb старый считает неправильно
    const qbReaction1 = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );

    const likesCount = await qbReaction1
      .where('r.status = :status AND r.parentId = :parentId', {
        status: likeStatus.Like,
        parentId: parentId,
      })
      .getCount();

    const dislikesCount = await qbReaction1
      .where('r.status = :status AND r.parentId = :parentId', {
        status: likeStatus.Dislike,
        parentId: parentId,
      })
      .getCount();

    const limitLike = 3;
    const tableNewestLike = await qbReaction1
      .where('r.parentId = :parentId AND r.status = :status', {
        parentId: parentId,
        status: likeStatus.Like,
      })
      .orderBy('r.createdAt', 'DESC')
      .limit(limitLike)
      .getRawMany();

    const newestLike = mapObject.mapRawManyQBOnTableName(tableNewestLike, [
      'r' + '_',
    ]);

    const lastLikeUser = mapObject.mapNewestLikesFromSql(newestLike);
    console.log('imenno tyt');
    console.log(likesCount);
    console.log(dislikesCount);
    return {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      lastLikeUser: lastLikeUser,
    };
  }
}
