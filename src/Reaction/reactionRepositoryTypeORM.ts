import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReactionEntity } from './Reaction.Entity';
import { likeStatus } from '../Enum';
import { Reaction } from './Reaction';
import { mapObject } from '../mapObject';
import { User } from '../User/User';
import { PostViewModel } from '../viewModelDTO';

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
      vision: true,
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
      .where(
        'r.userId = :userId AND r.parentId = :parentId AND r.vision = :vision',
        {
          userId: userId,
          parentId: parentId,
          vision: true,
        },
      )
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
      .where(
        'r.userId = :userId AND r.parentId = :parentId AND r.vision = :vision',
        {
          userId: newReaction.userId,
          parentId: parentId,
          vision: true,
        },
      )
      .getRawMany();
    console.log('take search');
    console.log(take);

    if (take.length < 1) {
      console.log('novyi');
      const reactionCreate = await this.reactionRepositoryTypeOrm.save(<
        ReactionEntity
      >{
        parentId: parentId,
        userId: newReaction.userId,
        userLogin: newReaction.userLogin,
        status: newReaction.status,
        createdAt: newReaction.createdAt,
        vision: true,
      });
    } else {
      console.log('staryi');
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
    const countLikeAndLastLikeStatus =
      await this.getCountReactionAndLastLikeStatusUser(parentId);
    return {
      likesCount: countLikeAndLastLikeStatus.likesCount,
      dislikesCount: countLikeAndLastLikeStatus.dislikesCount,
      lastLikeUser: countLikeAndLastLikeStatus.lastLikeUser,
    };
  }
  async getCountReactionAndLastLikeStatusUser(parentId: string) {
    const qbReaction1 = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );

    const likesCount = await qbReaction1
      .where(
        'r.status = :status AND r.parentId = :parentId AND r.vision = :vision',
        {
          status: likeStatus.Like,
          parentId: parentId,
          vision: true,
        },
      )
      .getCount();

    const dislikesCount = await qbReaction1
      .where(
        'r.status = :status AND r.parentId = :parentId AND r.vision = :vision',
        {
          status: likeStatus.Dislike,
          parentId: parentId,
          vision: true,
        },
      )
      .getCount();

    const limitLike = 3;
    const tableNewestLike = await qbReaction1
      .where(
        'r.parentId = :parentId AND r.status = :status AND r.vision = :vision',
        {
          parentId: parentId,
          status: likeStatus.Like,
          vision: true,
        },
      )
      .orderBy('r.createdAt', 'DESC')
      .limit(limitLike)
      .getRawMany();

    const newestLike = mapObject.mapRawManyQBOnTableName(tableNewestLike, [
      'r' + '_',
    ]);

    const lastLikeUser = mapObject.mapNewestLikesFromSql(newestLike);

    return {
      likesCount: likesCount,
      dislikesCount: dislikesCount,
      lastLikeUser: lastLikeUser,
    };
  }
  async updateReactionVision(userId: string, visionStatus: boolean) {
    const qbReaction = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    const update = await qbReaction
      .update(ReactionEntity)
      .set({
        vision: visionStatus,
      })
      .where('userId = :userId', {
        userId: userId,
      })
      .execute();
    return;
  }
  async getAllParentInAddReactionBanUser(userId: string) {
    const parentIdArray: string[] = [];
    const qbReaction1 = await this.reactionRepositoryTypeOrm.createQueryBuilder(
      'r',
    );
    const selectParentIdArray = await qbReaction1
      .select('r.parentId')
      .where('r.userId = :userId', {
        userId: userId,
      })
      .getMany();
    console.log(selectParentIdArray);
    for (const parentIdSelect of selectParentIdArray) {
      console.log(parentIdSelect.parentId);
      parentIdArray.push(parentIdSelect.parentId);
    }
    return parentIdArray;
  }
}
