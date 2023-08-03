import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { helper } from './helper';
import { CommentatorInfo, LikesInfo } from './Comment/Comment';
import { likeStatus } from './Enum';

export class CreateUserDto {
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  login: string;

  @IsString()
  @Length(6, 20)
  password: string;

  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}

export class CreateBlogDTO {
  @IsString()
  @Length(1, 15)
  name: string;
  @IsString()
  @Length(1, 500)
  description: string;
  @IsString()
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}

export class CreatePostDTO {
  @IsString()
  @Length(1, 30)
  title: string;
  @IsString()
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Length(1, 1000)
  content: string;
  @IsString()
  @Length(1)
  blogId: string;
}

export class CreatePostByBlogDTO {
  @IsString()
  @Length(1, 30)
  title: string;
  @IsString()
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Length(1, 1000)
  content: string;
}
export class CreateCommentDto {
  @IsString()
  @Length(20, 300)
  content: string;
}
export class UpdateLikeStatusCommentDto {
  @IsString()
  @IsEnum(likeStatus)
  likeStatus: likeStatus;
}
export class PaginationDTO {
  @IsOptional()
  @Type((type) => Number)
  @Min(1)
  //@Transform(({ value }) => helper.toNumber(value,  1,  1))
  @IsNumber()
  pageNumber: number;
  @IsOptional()
  @Type((type) => Number)
  @Min(1)
  //@Transform(({ value }) => helper.toNumber(value,  1,  10),)
  @IsNumber()
  pageSize: number;
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  //@Transform(({ value }) => helper.toSortBy(value,'createdAt'))
  sortBy: string;
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  //@Transform(({ value }) => helper.toSortDirection(value,-1))
  sortDirection: -1 | 1;
}

export class UserPaginationDTO extends PaginationDTO {
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  searchLoginTerm: string | null;
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  searchEmailTerm: string | null;
}

export class BlogPaginationDTO extends PaginationDTO {
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  searchNameTerm: string | null;
}

export type outputModel<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

export type OutputCommentType = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
};

export class LoginDto {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  login: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  password: string;
}

export class RegistrationConfirmation {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  code: string;
}
