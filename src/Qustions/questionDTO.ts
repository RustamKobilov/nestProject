import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { helper } from '../helper';
import { PaginationDTO } from '../DTO';
import { publishedStatusEnum } from './questionEnum';

export class CreateQuestionDTO {
  @IsString()
  @Transform(({ value }) => helper.getValueTrim(value))
  @Length(10, 500)
  body: string;
  @IsArray()
  @ArrayMinSize(1)
  @Type(() => String)
  correctAnswers: string[];
}
export class QuestionsPaginationDTO extends PaginationDTO {
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  bodySearchTerm: string | null;
  @IsOptional()
  @IsString()
  @IsEnum(publishedStatusEnum)
  @Transform(({ value }) => helper.getValueTrim(value))
  publishedStatus: string | null;
}

export class QuestionViewModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
