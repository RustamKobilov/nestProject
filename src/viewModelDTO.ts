import { ExtendedLikesInfo } from './Post/Post';
import { CommentatorInfo, LikesInfo } from './Comment/Comment';

export class UserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
}

export class BlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  images: BlogImagesViewModel;
}

export class PostViewModel {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
  images: PostImagesViewModel;
}
export class CommentViewModel {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
}
export class newestLikeViewModel {
  addedAt: string;
  userId: string;
  login: string;
}
export class MeViewModel {
  email: string;
  login: string;
  userId: string;
}
export class DeviceViewModel {
  ip: string;
  title: string;
  lastActiveDate: string;
  deviceId: string;
}
export class SaBlogViewModel {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: string;
  isMembership: boolean;
  blogOwnerInfo: {
    userId: string;
    userLogin: string;
  };
  banInfo: {
    isBanned: boolean;
    banDate: string;
  };
}
export class SaUserViewModel {
  id: string;
  login: string;
  email: string;
  createdAt: string;
  banInfo: {
    isBanned: boolean;
    banDate: string | null;
    banReason: string | null;
  };
}
export class UserBannedForParentViewModel {
  id: string;
  login: string;
  banInfo: {
    isBanned: boolean;
    banDate: string;
    banReason: string;
  };
}
export class PostInfo {
  id: string;
  title: string;
  blogId: string;
  blogName: string;
}
export class BloggerCommentViewModel extends CommentViewModel {
  postInfo: PostInfo;
}

export class ImageSizeViewModel {
  url: string;
  width: number;
  height: number;
  fileSize: number;
}
// export class EmptyImageSizeViewModel {
//   url: null;
//   width: null;
//   height: null;
//   fileSize: null;
// }
export class PostImagesViewModel {
  main: ImageSizeViewModel[];
}
export class BlogImagesViewModel {
  wallpaper: ImageSizeViewModel | null;
  main: ImageSizeViewModel[];
}
