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
