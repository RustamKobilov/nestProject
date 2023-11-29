import { QuestionEntity } from './Entitys/QuestionEntity';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayer,
  QuestionViewModel,
  SaQuestionViewModel,
} from './questionDTO';
import { gameStatusesEnum } from './questionEnum';
import { GameEntity } from './Entitys/GameEntity';

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
  // mapPlayersEntity(players: any): PlayerEntityType[] {
  //   const playerEntitys: PlayerEntityType[] = [];
  //   for (const player of players) {
  //     playerEntitys.push({
  //       gameId: player.gameId,
  //       playerId: player.playerId,
  //       playerLogin: player.playerLogin,
  //       playerScore: player.playerScore,
  //       playerAnswers: player.playerAnswers,
  //       status: player.status,
  //       playerPairCreatedDate: player.playerPairCreatedDate,
  //     });
  //   }
  //   return playerEntitys;
  // },
  mapGamePairViewModelPendingSecondPlayer(
    game: GameEntity,
  ): GamePairViewModelPendingSecondPlayer {
    return {
      id: game.id,
      firstPlayerProgress: {
        answers: [],
        player: {
          id: game.firstPlayerId,
          login: game.firstPlayerLogin,
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
  mapGameViewModel(games: GameEntity[]) /*: GamePairViewModel[]*/ {
    //TODO ttype no initilize
    const gamesPairViewModel: GamePairViewModel[] = [];
    for (const game of games) {
      const gamePairViewModel: GamePairViewModel = {
        id: game.id,
        firstPlayerProgress: {
          player: {
            id: game.firstPlayerId,
            login: game.firstPlayerLogin,
          },
          answers: game.firstPlayerAnswers,
          score: game.firstPlayerScore,
        },
        secondPlayerProgress: {
          player: {
            id: game.secondPlayerId,
            login: game.secondPlayerLogin,
          },
          answers: game.secondPlayerAnswers,
          score: game.secondPlayerScore,
        },
        questions: game.questions,
        status: game.status,
        pairCreatedDate: game.pairCreatedDate,
        startGameDate: game.startGameDate,
        finishGameDate: game.finishGameDate,
      };
      gamesPairViewModel.push(gamePairViewModel);
    }
    return /*gamesPairViewModel*/ true;
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
