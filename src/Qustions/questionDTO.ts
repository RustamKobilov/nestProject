import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { helper } from '../helper';
import { PaginationSqlDTO } from '../DTO';
import {
  answerStatusesEnum,
  gameStatusesEnum,
  publishedStatusEnum,
} from './questionEnum';
import { PostEntity } from '../Post/Post.Entity';
import { NewestLikes } from '../Post/Post';
import { PostViewModel } from '../viewModelDTO';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

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
export class QuestionsPaginationDTO extends PaginationSqlDTO {
  @IsOptional()
  @Transform(({ value }) => helper.getValueTrim(value))
  bodySearchTerm: string;
  @IsOptional()
  @IsString()
  @IsEnum(publishedStatusEnum)
  @Transform(({ value }) => helper.getValueTrim(value))
  publishedStatus: publishedStatusEnum;
}
export class UpdatePublishedQuestionDTO {
  @IsOptional()
  @IsBoolean()
  published: boolean;
}

export class QuestionsPagination {
  pageNumber: number;
  pageSize: number;
  sortBy: string;
  sortDirection: string;
  bodySearchTerm: string;
  published: boolean;
}

export class SaQuestionViewModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
//TODO убрать приенить entity класс
export class GamePairViewModel {
  id: string;
  firstPlayerProgress: {
    answers: AnswerViewModel[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: {
    answers: AnswerViewModel[];
    player: {
      id: string | null;
      login: string | null;
    };
    score: number;
  };
  questions: QuestionViewModel[] = [];
  status: gameStatusesEnum;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
}
export class GamePairViewModelPendingSecondPlayer {
  id: string;
  firstPlayerProgress: {
    answers: AnswerViewModel[];
    player: {
      id: string;
      login: string;
    };
    score: number;
  };
  secondPlayerProgress: null;
  questions: null;
  status: gameStatusesEnum.PendingSecondPlayer;
  pairCreatedDate: string;
  startGameDate: null;
  finishGameDate: null;
}

export class AnswerViewModel {
  questionId: string;
  answerStatus: answerStatusesEnum;
  addedAt: string;
}
export class QuestionViewModel {
  id: string;
  body: string;
}
export const mapQuestion = {
  mapQuestionFromSql(sqlArray: QuestionEntity[]): SaQuestionViewModel[] {
    const questionsViewModel: SaQuestionViewModel[] = [];
    for (const question of sqlArray) {
      questionsViewModel.push({
        id: question.id,
        body: question.body,
        createdAt: question.createdAt,
        correctAnswers: question.correctAnswers,
        published: question.published,
        updatedAt: question.updatedAt,
      });
    }
    return questionsViewModel;
  },
};
