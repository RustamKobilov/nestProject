import { ExtendedLikesInfo } from './Post/Post';
import { IsString } from 'class-validator';
import { Transform } from 'class-transformer';
import { helper } from './helper';

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
export class MeViewModel {
  email: string;
  login: string;
  userId: string;
}
