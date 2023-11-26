import {
  IsEmpty,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Min,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { helper } from './helper';
import { CommentatorInfo, LikesInfo } from './Comment/Comment';
import { likeStatus } from './Enum';
import {
  IsBlogChecking,
  IsEmailNoUnique,
  IsEntityQuestionChecking,
  IsLoginNoUnique,
} from './pipes/customValidator';

export class CreateUserDto {
  @IsString()
  @Length(3, 10)
  @Matches(/^[a-zA-Z0-9_-]*$/)
  @IsLoginNoUnique({
    message: 'User $value busy. Decorator /DTO.',
  })
  login: string;
  @IsString()
  @Length(6, 20)
  password: string;

  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  @IsEmailNoUnique({
    message: 'User $value busy. Decorator /DTO.',
  })
  email: string;
}

export class CreateBlogDTO {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 15)
  name: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 500)
  description: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 100)
  @Matches(
    /^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/,
  )
  websiteUrl: string;
}

export class CreatePostDTO {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 1000)
  content: string;
  // @IsString()
  // @Transform(({ value }) => helper.getValueTrim(value))
  // @IsBlogChecking({
  //   message: 'Blog for $value not found. Decorator /DTO.',
  // })
  // @Length(1)
  // blogId: string;
}

export class CreatePostByBlogDTO {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 30)
  title: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 100)
  shortDescription: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(1, 1000)
  content: string;
}
export class CreateCommentDto {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(20, 300)
  content: string;
}
export class UpdateLikeStatusDto {
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

export class LoginDtoStrategy {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Transform(({ value }) => helper.getValueTrim(value))
  login: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Transform(({ value }) => helper.getValueTrim(value))
  password: string;
}

export class RegistrationConfirmation {
  @IsString()
  @IsUUID()
  @Transform(({ value }) => helper.getValueTrim(value))
  code: string;
}
export class EmailPasswordRecoveryDTO {
  @IsString()
  @Matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
  email: string;
}
export class UpdatePasswordDTO {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(6, 20)
  newPassword: string;
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  recoveryCode: string;
}

export class PaginationSqlDTO {
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
  sortBy: string;
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  //@Transform(({ value }) => helper.toSortDirection(value,-1))
  sortDirection: 'asc' | 'desc';
}
