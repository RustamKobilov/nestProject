import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Reaction } from './Reaction';
import { mapObject } from '../mapObject';
import { User } from '../User/User';
import { likeStatus } from '../Enum';

export class ReactionRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
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
    const zapros =
      'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
      ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
      " '" +
      parentId +
      "' " +
      ' AND reaction_entity."userId" = ' +
      " '" +
      userId +
      "' ";

    const reactionsSql = await this.dataSource.query(zapros);
    if (reactionsSql.length < 1) {
      return false;
    }
    const reactions = mapObject.mapReactionFromSql(reactionsSql);
    return reactions[0];
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
    const zaprosSelect =
      'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
      ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
      " '" +
      parentId +
      "' " +
      ' AND reaction_entity."userId" = ' +
      " '" +
      newReaction.userId +
      "' ";
    const reactionsSql = await this.dataSource.query(zaprosSelect);
    if (reactionsSql.length < 1) {
      console.log('novyi');
      const zaprosInsert =
        'INSERT INTO reaction_entity ("parentId", "userId", "userLogin", status, "createdAt")' +
        ' VALUES ($1, $2, $3, $4, $5)';
      const insertReaction = await this.dataSource.query(zaprosInsert, [
        parentId,
        newReaction.userId,
        newReaction.userLogin,
        newReaction.status,
        newReaction.createdAt,
      ]);
    } else {
      console.log('staryi');
      const zaprosUpdate =
        'UPDATE reaction_entity' +
        ' SET "userLogin"= $1, status= $2, "createdAt"= $3' +
        ' WHERE reaction_entity."parentId" = $4 AND reaction_entity."userId" = $5';
      const updateReaction = await this.dataSource.query(zaprosUpdate, [
        newReaction.userLogin,
        newReaction.status,
        newReaction.createdAt,
        parentId,
        newReaction.userId,
      ]);
    }
    const likesCount = await this.dataSource.query(
      'SELECT COUNT (*)  FROM reaction_entity' +
        ' WHERE reaction_entity."status" = ' +
        " '" +
        likeStatus.Like +
        "' " +
        ' AND ' +
        'reaction_entity."parentId" = ' +
        " '" +
        parentId +
        "' ",
    );
    const dislikesCount = await this.dataSource.query(
      'SELECT COUNT (*)  FROM reaction_entity' +
        ' WHERE reaction_entity."status" = ' +
        " '" +
        likeStatus.Dislike +
        "' " +
        ' AND ' +
        'reaction_entity."parentId" = ' +
        " '" +
        parentId +
        "' ",
    );

    const limitLike = 3;
    const zaprosForNewestLike =
      'SELECT "parentId", "userId", "userLogin", status, "createdAt"' +
      ' FROM reaction_entity WHERE reaction_entity."parentId" = ' +
      " '" +
      parentId +
      "' " +
      ' ORDER BY reaction_entity."createdAt" DESC LIMIT 3';
    const tableNewestLike = await this.dataSource.query(zaprosForNewestLike);
    const lastlikeUser = mapObject.mapNewestLikesFromSql(tableNewestLike);
    console.log('imenno tyt');
    console.log(likesCount);
    console.log(dislikesCount);
    return {
      likesCount: likesCount[0].count,
      dislikesCount: dislikesCount[0].count,
      lastLikeUser: lastlikeUser,
    };
  }
}
