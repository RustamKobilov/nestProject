import { User } from './User/User';
import {
  BloggerCommentViewModel,
  BlogImagesViewModel,
  BlogViewModel,
  CommentViewModel,
  DeviceViewModel,
  ImageSizeViewModel,
  MeViewModel,
  newestLikeViewModel,
  PostImagesViewModel,
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
import { ImagePurpose } from './Enum';
import { ParentBanListEntity } from './ParentBanList/ParentBanList.Entity';
import { BlogImageEntity } from './Images/Entity/BlogImage.Entity';
import { PostImageEntity } from './Images/Entity/PostImage.Entity';
import { countMainImageForBlog } from './constant';
import { BlogEntity } from './Blog/Blog.Entity';

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
  mapNewBlogForViewModelKostyl(
    blog: Blog,
    imageWallpaper: ImageSizeViewModel,
    imageMain: ImageSizeViewModel,
  ): BlogViewModel {
    return {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      images: {
        wallpaper: imageWallpaper,
        main: [imageMain],
      },
    };
  },
  mapBlogForViewModel(
    blog: Blog,
    arrayImagesWallpaper: BlogImageEntity[] = [],
    arrayImagesMain: BlogImageEntity[] = [],
  ): BlogViewModel {
    const arrayMainImage: ImageSizeViewModel[] = [];
    if (arrayImagesMain.length > 0) {
      for (const main of arrayImagesMain) {
        const mainImageViewModel: ImageSizeViewModel = {
          url: main.urlDownload,
          fileSize: main.fileSize,
          height: main.height,
          width: main.width,
        };
        arrayMainImage.push(mainImageViewModel);
      }
    }
    let wallpaperImage: ImageSizeViewModel | null = null;

    if (arrayImagesWallpaper.length > 0) {
      wallpaperImage = {
        url: arrayImagesWallpaper[0].urlDownload,
        fileSize: arrayImagesWallpaper[0].fileSize,
        height: arrayImagesWallpaper[0].height,
        width: arrayImagesWallpaper[0].width,
      };
    }

    return <BlogViewModel>{
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      images: {
        wallpaper: wallpaperImage,
        main: arrayMainImage,
      },
    };
  },

  mapSaBlogForViewModel(blog: Blog): SaBlogViewModel {
    const isBanned = blog.vision === true ? false : true;
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
        isBanned: isBanned,
        banDate: blog.createdAtVision,
      },
    };
  },
  mapPost(post: Post): Post {
    return <Post>{
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
  mapPostFromViewModel(
    post: PostEntity,
    newestLikes: NewestLikes[] = [],
    arrayMainImageForPost: PostImageEntity[] = [],
  ): PostViewModel {
    const arrayMainImage: ImageSizeViewModel[] = [];
    if (arrayMainImageForPost.length > 0) {
      for (const main of arrayMainImageForPost) {
        const mainImageViewModel: ImageSizeViewModel = {
          url: main.urlDownload,
          fileSize: main.fileSize,
          height: main.height,
          width: main.width,
        };
        arrayMainImage.push(mainImageViewModel);
      }
    }
    const postViewModel: PostViewModel = {
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
      images: {
        main: arrayMainImage,
      },
    };

    return postViewModel;
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
  mapCommentForBloggerCommentViewModel(
    sqlArray: any,
  ): BloggerCommentViewModel[] {
    const comments: BloggerCommentViewModel[] = [];
    for (const sqlComment of sqlArray) {
      const comment: BloggerCommentViewModel = {
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
        postInfo: {
          id: sqlComment.post.id,
          title: sqlComment.post.title,
          blogId: sqlComment.post.blogId,
          blogName: sqlComment.post.blogName,
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
  mapBlogImageForViewModel(
    imagesForBLog: BlogImageEntity[],
  ): BlogImagesViewModel {
    const blogImagesMainViewModel: ImageSizeViewModel[] = [];
    const blogImagesWallpaperViewModel: ImageSizeViewModel[] = [];
    const blogImagesViewModel: BlogImagesViewModel = {
      wallpaper: null,
      main: blogImagesMainViewModel,
    };
    for (const image of imagesForBLog) {
      //console.log(image);
      const blogImagesViewModel: ImageSizeViewModel = {
        url: image.urlDownload,
        fileSize: image.fileSize,
        height: image.height,
        width: image.width,
      };
      if (image.purpose === ImagePurpose.wallpaper) {
        blogImagesWallpaperViewModel.push(blogImagesViewModel);
      } else {
        blogImagesMainViewModel.push(blogImagesViewModel);
      }
    }
    if (blogImagesWallpaperViewModel.length !== 0) {
      blogImagesViewModel.wallpaper = blogImagesWallpaperViewModel[0];
    }
    return blogImagesViewModel;
  },
  mapPostImageForViewModel(
    imagesForPost: PostImageEntity[],
  ): PostImagesViewModel {
    const postImagesViewModel: PostImagesViewModel = {
      main: [],
    };
    for (const image of imagesForPost) {
      const postImagesMainViewModel: ImageSizeViewModel = {
        url: image.urlDownload,
        fileSize: image.fileSize,
        height: image.height,
        width: image.width,
      };
      postImagesViewModel.main.push(postImagesMainViewModel);
    }

    return postImagesViewModel;
  },
  mapBlogAndImageArrayForBlogViewModel(
    blog: BlogEntity,
    arrayWallpaperImageForBlog: BlogImageEntity[] = [],
    arrayMainImageForBlog: BlogImageEntity[] = [],
  ): BlogViewModel {
    const arrayMainImage: ImageSizeViewModel[] = [];
    if (arrayMainImageForBlog.length > 0) {
      for (const main of arrayMainImageForBlog) {
        const mainImageViewModel: ImageSizeViewModel = {
          url: main.urlDownload,
          fileSize: main.fileSize,
          height: main.height,
          width: main.width,
        };
        arrayMainImage.push(mainImageViewModel);
      }
    }

    const blogViewModel: BlogViewModel = {
      id: blog.id,
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
      images: {
        wallpaper:
          arrayWallpaperImageForBlog.length > 0
            ? <ImageSizeViewModel>{
                url: arrayWallpaperImageForBlog[0].urlDownload,
                fileSize: arrayWallpaperImageForBlog[0].fileSize,
                height: arrayWallpaperImageForBlog[0].height,
                width: arrayWallpaperImageForBlog[0].width,
              }
            : null,
        main: arrayMainImage,
      },
    };
    return blogViewModel;
  },
};
