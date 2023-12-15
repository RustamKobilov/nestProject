import { gameStatusesEnum } from '../Qustions/questionEnum';
import { AnswerViewModel, QuestionViewModel } from '../Qustions/questionDTO';
import { IsArray, IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationGetTopDTO {
  @IsOptional()
  @Type((type) => Number)
  @Min(1)
  @IsNumber()
  pageNumber: number;
  @IsOptional()
  @Type((type) => Number)
  @Min(1)
  @IsNumber()
  pageSize: number;
  @IsOptional()
  @IsArray()
  sort: string;
  //Default value : ?sort=avgScores desc&sort=sumScore desc
}
//TODO как валидировать массив или строку sort
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
export class GamePairViewModelPendingSecondPlayerViewModel {
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
export class StaticViewModel {
  sumScore: number; //Sum scores of all games
  avgScores: number; //Average score of all games rounded to 2 decimal places
  gamesCount: number; //All played games count
  winsCount: number; //
  lossesCount: number;
  drawsCount: number;
}
export class TopGamePlayerViewModel {
  sumScore: number; //Sum scores of all games
  avgScores: number; //Average score of all games rounded to 2 decimal places
  gamesCount: number; //All played games count
  winsCount: number; //
  lossesCount: number;
  drawsCount: number;
  player: {
    id: string;
    login: string;
  };
}
