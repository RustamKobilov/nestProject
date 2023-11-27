import { PlayerEntity, QuestionEntity } from './Entitys/QuestionEntity';
import {
  GamePairViewModelPendingSecondPlayer,
  QuestionViewModel,
} from './questionDTO';
import { gameStatusesEnum } from './questionEnum';

export const mapQuestions = {
  mapQuestionsViewModel(questions: QuestionEntity[]): QuestionViewModel[] {
    const questionsViewModel: QuestionViewModel[] = [];
    for (const question of questions) {
      questionsViewModel.push({
        id: question.id,
        body: question.body,
        correctAnswers: question.correctAnswers,
        published: question.published,
        createdAt: question.createdAt,
        updatedAt: question.updatedAt,
      });
    }
    return questionsViewModel;
  },
  mapGamePairViewModelPendingSecondPlayer(
    player: PlayerEntity,
  ): GamePairViewModelPendingSecondPlayer {
    return {
      id: player.idGame,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: player.playerId,
          login: player.playerLogin,
        },
        score: 0,
      },
      secondPlayerProgress: null,
      questions: null,
      status: gameStatusesEnum.PendingSecondPlayer,
      pairCreatedDate: new Date().toISOString(),
      startGameDate: null,
      finishGameDate: null,
    };
  },
};
