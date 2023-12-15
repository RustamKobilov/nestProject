import { QuestionEntity } from '../Qustions/QuestionEntity';
import {
  QuestionViewModel,
  SaQuestionViewModel,
} from '../Qustions/questionDTO';
import { gameStatusesEnum } from '../Qustions/questionEnum';
import { GameEntity, QuestionInGameEntityType } from './GameEntity';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayerViewModel,
} from './gameDTO';

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
  mapGamePairViewModelPendingSecondPlayer(
    game: GameEntity,
  ): GamePairViewModelPendingSecondPlayerViewModel {
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
      pairCreatedDate: game.pairCreatedDate,
      startGameDate: null,
      finishGameDate: null,
    };
  },
  mapGamesViewModel(games: GameEntity[]): GamePairViewModel[] {
    const gamesPairViewModel: GamePairViewModel[] = [];
    for (const game of games) {
      const questionViewModel = mapKuiz.mapQuestionsViewModelForGameEntityType(
        game.questions,
      );
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
        questions: questionViewModel,
        status: game.status,
        pairCreatedDate: game.pairCreatedDate,
        startGameDate: game.startGameDate,
        finishGameDate: game.finishGameDate,
      };
      gamesPairViewModel.push(gamePairViewModel);
    }
    return gamesPairViewModel;
  },
  mapQuestionsViewModel(sqlQuestions: QuestionEntity[]): QuestionViewModel[] {
    const questionsViewModel: QuestionViewModel[] = [];
    for (const question of sqlQuestions) {
      console.log(question);
      console.log(question.id);
      console.log(question.body);
      const questionViewModel: QuestionViewModel = {
        id: question.id,
        body: question.body,
      };
      questionsViewModel.push(questionViewModel);
    }
    return questionsViewModel;
  },
  mapQuestionsViewModelForGameEntityType(
    sqlQuestions: QuestionInGameEntityType[],
  ): QuestionViewModel[] {
    const questionsViewModel: QuestionViewModel[] = [];
    for (const question of sqlQuestions) {
      console.log(question);
      console.log(question.id);
      console.log(question.body);
      const questionViewModel: QuestionViewModel = {
        id: question.id,
        body: question.body,
      };
      questionsViewModel.push(questionViewModel);
    }
    return questionsViewModel;
  },
  mapQuestionInGameEntityType(
    sqlQuestions: QuestionEntity[],
  ): QuestionInGameEntityType[] {
    const questionInGameEntityType: QuestionInGameEntityType[] = [];
    for (const question of sqlQuestions) {
      console.log(question);
      console.log(question.id);
      console.log(question.body);
      const questionQuestionInGameEntityType: QuestionInGameEntityType = {
        id: question.id,
        body: question.body,
        correctAnswers: question.correctAnswers,
      };
      questionInGameEntityType.push(questionQuestionInGameEntityType);
    }
    return questionInGameEntityType;
  },
};
