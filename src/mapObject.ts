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
import { ReactionEntity } from './Like/Reaction.Entity';

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
  mapNewestLikes(reaction: Reaction): newestLikeViewModel {
    return {
      addedAt: reaction.createdAt,
      userId: reaction.userId,
      login: reaction.userLogin,
    };
  },
  mapNewestLikesFromSql(sqlArray: [any]) {
    const newestLikes: NewestLikes[] = [];
    for (const sqlReaction of sqlArray) {
      const newestLike = {
        addedAt: sqlReaction.createdAt_Reaction,
        userId: sqlReaction.userId,
        login: sqlReaction.userLogin,
      };
      newestLikes.push(newestLike);
    }
    return newestLikes;
  },
  mapNewestLikesAndPostsFromSql(sqlArray: [any]): Post[] {
    //const newestLikes: NewestLikes[] = [];
    const posts: Post[] = [];
    console.log('my tyt');
    posts.push(this.mapPostFromSql(sqlArray[0]));
    console.log(posts + ' posts after step 1');
    for (const sqlReactionAndPost of sqlArray) {
      console.log('my tyt1');
      for (const postElement of posts) {
        console.log('my tyt2');
        console.log(postElement);
        console.log(' vPoste ');
        console.log(sqlReactionAndPost);
        console.log(' IzBase ');

        if (sqlReactionAndPost.id === postElement.id) {
          console.log('sqlReactionAndPost.id === post.id end');
          break;
        }
        console.log('CREATE POST!');
        const post: Post = {
          id: sqlReactionAndPost.id,
          title: sqlReactionAndPost.title,
          shortDescription: sqlReactionAndPost.shortDescription,
          content: sqlReactionAndPost.content,
          blogId: sqlReactionAndPost.blogId,
          blogName: sqlReactionAndPost.blogName,
          createdAt: sqlReactionAndPost.createdAt,
          extendedLikesInfo: {
            likesCount: sqlReactionAndPost.likesCount,
            dislikesCount: sqlReactionAndPost.dislikesCount,
            myStatus: sqlReactionAndPost.myStatus,
            newestLikes: [],
          },
        };
        posts.push(post);
      }
      console.log('const newestLike = { end ');
      const newestLike = {
        addedAt: sqlReactionAndPost.createdAt_Reaction,
        userId: sqlReactionAndPost.userId,
        login: sqlReactionAndPost.userLogin,
      };
      posts.map(function (post) {
        console.log('  posts.map(function(post)  ');
        if (post.id === sqlReactionAndPost.id) {
          post.extendedLikesInfo.newestLikes.push(newestLike);
          console.log('  end map in IF  ');
          return;
        }
        console.log('  end map out  ');
        return;
      });
      console.log('  sqlReactionAndPost end FOR  ');
    }
    console.log(posts);
    return posts;
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
