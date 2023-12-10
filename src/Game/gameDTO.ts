import { gameStatusesEnum } from '../Qustions/questionEnum';
import { AnswerViewModel, QuestionViewModel } from '../Qustions/questionDTO';

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
export class StaticViewModel {
  sumScore: number; //Sum scores of all games
  avgScores: number; //Average score of all games rounded to 2 decimal places
  gamesCount: number; //All played games count
  winsCount: number; //
  lossesCount: number;
  drawsCount: number;
}
