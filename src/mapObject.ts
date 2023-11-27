import { User } from './User/User';
import {
  BlogViewModel,
  CommentViewModel,
  DeviceViewModel,
  MeViewModel,
  newestLikeViewModel,
  PostViewModel,
  UserViewModel,
} from './viewModelDTO';
import { Blog } from './Blog/Blog';
import { NewestLikes, Post } from './Post/Post';
import { Reaction } from './Like/Reaction';
import { Comment } from './Comment/Comment';
import { Device } from './Device/Device';
import { PostEntity } from './Post/Post.Entity';
import {
  GameEntity,
  PlayerEntity,
  QuestionEntity,
} from './Qustions/Entitys/QuestionEntity';
import { GamePairViewModel } from './Qustions/questionDTO';
import { gameStatusesEnum } from './Qustions/questionEnum';

export const mapObject = {
  mapRawManyQBOnTableName(rawArray: any[], nameTable: any[]): any {
    for (const name of nameTable) {
      console.log(name);
      for (const user of rawArray) {
        // console.log('before');
        // console.log(user);
        Object.keys(user).forEach((key) => {
          const newKey = key.replace(name, '');
          const valueKey = user[key];
          //console.log(newKey + ' newKey');
          delete user[key];
          user[newKey] = valueKey;
        });
      }
    }
    console.log('rawArray');
    console.log(rawArray);
    return rawArray;
  },
  mapUsersFromSql(sqlArray: any[any]): User[] {
    const users: User[] = [];
    for (const sqlUser of sqlArray) {
      const user: User = {
        id: sqlUser.id,
        login: sqlUser.login,
        email: sqlUser.email,
        createdAt: sqlUser.createdAt,
        salt: sqlUser.salt,
        password: sqlUser.password,
        recoveryPasswordInfo: {
          recoveryCode: sqlUser.recoveryCode,
          diesAtDate: sqlUser.diesAtDate,
        },
        userConfirmationInfo: {
          userConformation: sqlUser.userConformation,
          code: sqlUser.code,
          expirationCode: sqlUser.expirationCode,
        },
      };
      users.push(user);
    }
    return users;
  },
  mapUserForViewModel(user: User): UserViewModel {
    return {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  },
  mapBlogForViewModel(blog: Blog): BlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  },
  mapPost(post: Post): PostViewModel {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: post.extendedLikesInfo,
    };
  },
  mapPostFromSql(
    post: PostEntity,
    newestLikes: NewestLikes[] = [],
  ): PostViewModel {
    return {
      id: post.id,
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: post.likesCount,
        dislikesCount: post.dislikesCount,
        myStatus: post.myStatus,
        newestLikes: newestLikes,
      },
    };
  },
  mapComment(comment: Comment): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: comment.likesInfo,
    };
  },
  mapCommentFromSql(sqlArray: [any]) {
    const comments: CommentViewModel[] = [];
    for (const sqlComment of sqlArray) {
      const comment: CommentViewModel = {
        id: sqlComment.id,
        content: sqlComment.content,
        createdAt: sqlComment.createdAt,
        commentatorInfo: {
          userId: sqlComment.userId,
          userLogin: sqlComment.userLogin,
        },
        likesInfo: {
          likesCount: sqlComment.likesCount,
          dislikesCount: sqlComment.dislikesCount,
          myStatus: sqlComment.myStatus,
        },
      };
      comments.push(comment);
    }
    return comments;
  },
  mapNewestLikes(reaction: Reaction): newestLikeViewModel {
    return {
      addedAt: reaction.createdAt,
      userId: reaction.userId,
      login: reaction.userLogin,
    };
  },
  mapNewestLikesFromSql(sqlArray: any[]) {
    const newestLikes: newestLikeViewModel[] = [];
    for (const sqlReaction of sqlArray) {
      const newestLike = {
        addedAt: sqlReaction.createdAt,
        userId: sqlReaction.userId,
        login: sqlReaction.userLogin,
      };
      newestLikes.push(newestLike);
    }
    return newestLikes;
  },
  mapReactionFromSql(sqlArray: [any]) {
    const reactions: Reaction[] = [];
    for (const reactionSql of sqlArray) {
      const reaction: Reaction = {
        userId: reactionSql.userId,
        userLogin: reactionSql.userLogin,
        status: reactionSql.status,
        parentId: reactionSql.parentId,
        createdAt: reactionSql.createdAt,
      };
      reactions.push(reaction);
    }
    return reactions;
  },
  mapDeviceFromSql(sqlArray: [any]): Device[] {
    const devices: Device[] = [];
    for (const deviceSql of sqlArray) {
      const device: Device = {
        userId: deviceSql.userId,
        deviceId: deviceSql.deviceId,
        lastActiveDate: deviceSql.lastActiveDate,
        diesAtDate: deviceSql.diesAtDate,
        title: deviceSql.title,
        ip: deviceSql.ip,
      };
      devices.push(device);
    }
    return devices;
  },
  mapDevicesFromSql(sqlArray: [any]): DeviceViewModel[] {
    const devices: DeviceViewModel[] = [];
    for (const deviceSql of sqlArray) {
      const device: DeviceViewModel = {
        deviceId: deviceSql.deviceId,
        lastActiveDate: deviceSql.lastActiveDate,
        title: deviceSql.title,
        ip: deviceSql.ip,
      };
      devices.push(device);
    }
    return devices;
  },
  mapMeUserInformation(user: User): MeViewModel {
    return {
      userId: user.id,
      login: user.login,
      email: user.email,
    };
  },
  mapDevice(device: Device): DeviceViewModel {
    return {
      ip: device.ip,
      title: device.title,
      lastActiveDate: device.lastActiveDate,
      deviceId: device.deviceId,
    };
  },
  mapPlayersEntity(players: any): PlayerEntity[] {
    const playerEntitys: PlayerEntity[] = [];
    for (const player of players) {
      playerEntitys.push({
        idGame: player.idGame,
        playerId: player.playerId,
        playerLogin: player.playerLogin,
        playerScore: player.playerScore,
        playerAnswers: player.playerAnswers,
        status: player.status,
        playerPairCreatedDate: player.playerPairCreatedDate,
      });
    }
    return playerEntitys;
  },
  mapGameViewModel(
    playerAwait: PlayerEntity,
    playerConnect: PlayerEntity,
    game: GameEntity,
    questions: QuestionEntity[],
  ): GamePairViewModel {
    return {
      id: game.id,
      firstPlayerProgress: {
        player: {
          id: playerConnect.playerId,
          login: playerConnect.playerLogin,
        },
        answers: playerConnect.playerAnswers,
        score: playerConnect.playerScore,
      },
      secondPlayerProgress: {
        player: {
          id: playerAwait.playerId,
          login: playerAwait.playerLogin,
        },
        answers: playerAwait.playerAnswers,
        score: playerAwait.playerScore,
      },
      questions: questions,
      status: gameStatusesEnum.Active,
      pairCreatedDate: playerAwait.playerPairCreatedDate,
      startGameDate: new Date().toISOString(),
      finishGameDate: null,
    };
  },
  mapQuestions(qbQuestions: QuestionEntity[]) {},
};
