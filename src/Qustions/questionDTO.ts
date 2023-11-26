import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { helper } from '../helper';
import { PaginationSqlDTO } from '../DTO';
import { publishedStatusEnum } from './questionEnum';
import { PostEntity } from '../Post/Post.Entity';
import { NewestLikes } from '../Post/Post';
import { PostViewModel } from '../viewModelDTO';
import { QuestionEntity } from './Entitys/QuestionEntity';

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

export class QuestionViewModel {
  id: string;
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: string;
  updatedAt: string;
}
export class GamePairViewModel {
  id: string;

  //   "firstPlayerProgress": {
  //     "answers": [
  //       {
  //         "questionId": "string",
  //         "answerStatus": "Correct",
  //         "addedAt": "2023-11-26T14:41:43.251Z"
  //       }
  //     ],
  //     "player": {
  //       "id": "string",
  //       "login": "string"
  //     },
  //     "score": 0
  //   },
  //   "secondPlayerProgress": {
  //     "answers": [
  //       {
  //         "questionId": "string",
  //         "answerStatus": "Correct",
  //         "addedAt": "2023-11-26T14:41:43.251Z"
  //       }
  //     ],
  //     "player": {
  //       "id": "string",
  //       "login": "string"
  //     },
  //     "score": 0
  //   },
  //   "questions": [
  //     {
  //       "id": "string",
  //       "body": "string"
  //     }
  //   ],
  //   "status": "PendingSecondPlayer",
  //   "pairCreatedDate": "2023-11-26T14:41:43.251Z",
  //   "startGameDate": "2023-11-26T14:41:43.251Z",
  //   "finishGameDate": "2023-11-26T14:41:43.251Z"
}
export class AnswerViewModel {}
export const mapQuestion = {
  mapQuestionFromSql(sqlArray: QuestionEntity[]): QuestionViewModel[] {
    const questionsViewModel: QuestionViewModel[] = [];
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
