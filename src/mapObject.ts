import { User } from './User/User';
import {
  BlogViewModel,
  CommentViewModel,
  DeviceViewModel,
  MeViewModel,
  newestLikeViewModel,
  PostViewModel,
  SaBlogViewModel,
  SaUserViewModel,
  UserBannedForParentViewModel,
  UserViewModel,
} from './viewModelDTO';
import { Blog } from './Blog/Blog';
import { NewestLikes, Post } from './Post/Post';
import { Reaction } from './Reaction/Reaction';
import { Comment } from './Comment/Comment';
import { Device } from './Device/Device';
import { PostEntity } from './Post/Post.Entity';
import { UserBanListEntity } from './UserBanList/UserBanList.Entity';
import { BanStatusForAdminPagination } from './Enum';
import { ParentBanListEntity } from './ParentBanList/ParentBanList.Entity';

export const mapObject = {
  mapRawManyQBOnTableNameIsNotNull(rawArray: any[], nameTable: any[]): any {
    for (const name of nameTable) {
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
    return rawArray;
  },
  mapRawManyQBOnTableNameIsNullIdUserBan(
    rawArray: any[],
    nameTable: any[],
  ): any {
    for (const name of nameTable) {
      for (const user of rawArray) {
        // console.log('before');
        // console.log(user);
        Object.keys(user).forEach((key) => {
          const newKey = key.replace(name, '');
          const valueKey = user[key];
          delete user[key];
          if (key !== 'uBL_id') {
            user[newKey] = valueKey;
          }
        });
      }
    }
    // console.log(rawArray);
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
  mapSaUserForViewModel(sqlArray: any[any]): SaUserViewModel[] {
    const users: SaUserViewModel[] = [];
    for (const sqlUser of sqlArray) {
      const saUser: SaUserViewModel = {
        id: sqlUser.id,
        login: sqlUser.login,
        email: sqlUser.email,
        createdAt: sqlUser.createdAt,
        banInfo: {
          isBanned: sqlUser.isBanned,
          banDate: sqlUser.banDate,
          banReason: sqlUser.banReason,
        },
      };
      users.push(saUser);
    }
    return users;
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
  //TODO таблица с банами блога время негде фиксировать возможно поле в блоге.мап сменить
  mapSaBlogForViewModel(blog: Blog): SaBlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      blogOwnerInfo: {
        userId: blog.userId,
        userLogin: blog.userLogin,
      },
      banInfo: {
        isBanned: false,
        banDate: 'string',
      },
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
  mapPostFromSql(post: PostEntity, newestLikes: NewestLikes[] = []): Post {
    return {
      id: post.id,
      userId: post.userId,
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
      vision: post.vision,
    };
  },
  mapPostFromSqlFromViewModel(
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
        vision: reactionSql.vision,
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
  mapSaUser(sqlArray: [any]): SaUserViewModel[] {
    const resultUsers: SaUserViewModel[] = [];
    for (const user of sqlArray) {
      const userSaViewModel: SaUserViewModel = {
        id: user.id,
        login: user.login,
        email: user.email,
        createdAt: user.createdAt,
        banInfo: {
          isBanned: user.banDate === null ? false : true,
          banDate: user.banDate,
          banReason: user.banReason,
        },
      };
      resultUsers.push(userSaViewModel);
    }
    return resultUsers;
  },
  mapUserBannedForParent(
    parentBanListEntity: ParentBanListEntity[],
  ): UserBannedForParentViewModel[] {
    const resultUsers: UserBannedForParentViewModel[] = [];
    for (const rowParentBanListEntity of parentBanListEntity) {
      const userBannedForParentViewModel: UserBannedForParentViewModel = {
        id: rowParentBanListEntity.userId,
        login: rowParentBanListEntity.userLogin,
        banInfo: {
          isBanned: true,
          banDate: rowParentBanListEntity.createdAt,
          banReason: rowParentBanListEntity.banReason,
        },
      };
      resultUsers.push(userBannedForParentViewModel);
    }
    return resultUsers;
  },
};
