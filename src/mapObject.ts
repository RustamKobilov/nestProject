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
import { Post } from './Post/Post';
import { Reaction } from './Like/Reaction';
import { Comment } from './Comment/Comment';
import { Device } from './Device/Device';

export const mapObject = {
  //TODO как проставить тепизацию на выход и вход чтобы не ругалось на never. какой тип у массиа приходящего
  mapUsersFromSql(sqlArray: [any]) {
    const users: any[] = [];
    for (const sqlUser of sqlArray) {
      const user = {
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
  mapComment(comment: Comment): CommentViewModel {
    return {
      id: comment.id,
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: comment.likesInfo,
    };
  },
  mapNewestLikes(reaction: Reaction): newestLikeViewModel {
    return {
      addedAt: reaction.createdAt,
      userId: reaction.userId,
      login: reaction.userLogin,
    };
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
};
// const user = table.map((value) => {
//   return {
//     id: value.id,
//     login: value.login,
//     email: value.email,
//     createdAt: value.createdAt,
//     salt: value.salt,
//     password: value.password,
//     recoveryPasswordInfo: {
//       recoveryCode: value.recoveryCode,
//       diesAtDate: value.diesAtDate,
//     },
//     userConfirmationInfo: {
//       userConformation: value.userConformation,
//       code: value.code,
//       expirationCode: value.expirationCode,
//     },
//   };
// });
