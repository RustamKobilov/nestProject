import { QuestionEntity } from './Entitys/QuestionEntity';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayer,
  QuestionViewModel,
  SaQuestionViewModel,
} from './questionDTO';
import { gameStatusesEnum } from './questionEnum';
import { PlayerEntityType } from './Entitys/PlayerEntity';
import { GameEntityType } from './Entitys/GameEntity';

export const mapKuiz = {
  mapSaQuestionsViewModel(questions: QuestionEntity[]): SaQuestionViewModel[] {
    const questionsViewModel: SaQuestionViewModel[] = [];
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
  mapPlayersEntity(players: any): PlayerEntityType[] {
    const playerEntitys: PlayerEntityType[] = [];
    for (const player of players) {
      playerEntitys.push({
        idGame: player.idGame,
        playerId: player.playerId,
        playerLogin: player.playerLogin,
        playerScore: player.playerScore,
        playerAnswers: player.playerAnswers,
        status: player.status,
        playerPairCreatedDate: player.playerPairCreatedDate,
      });
    }
    return playerEntitys;
  },
  mapGamePairViewModelPendingSecondPlayer(
    player: PlayerEntityType,
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
  mapGameViewModel(
    playerAwait: PlayerEntityType,
    playerConnect: PlayerEntityType,
    game: GameEntityType,
    questions: QuestionViewModel[],
  ): GamePairViewModel {
    return {
      id: game.id,
      firstPlayerProgress: {
        player: {
          id: playerConnect.playerId,
          login: playerConnect.playerLogin,
        },
        answers: playerConnect.playerAnswers,
        score: playerConnect.playerScore,
      },
      secondPlayerProgress: {
        player: {
          id: playerAwait.playerId,
          login: playerAwait.playerLogin,
        },
        answers: playerAwait.playerAnswers,
        score: playerAwait.playerScore,
      },
      questions: questions,
      status: gameStatusesEnum.Active,
      pairCreatedDate: playerAwait.playerPairCreatedDate,
      startGameDate: new Date().toISOString(),
      finishGameDate: game.finishGameDate,
    };
  },
  mapQuestionsViewModel(sqlQuestions: QuestionEntity[]): QuestionViewModel[] {
    const questionsViewModel: QuestionViewModel[] = [];
    for (const question of sqlQuestions) {
      console.log(question);
      const questionViewModel: QuestionViewModel = {
        id: question.id,
        body: question.body,
      };
      questionsViewModel.push(questionViewModel);
    }
    return questionsViewModel;
  },
};
