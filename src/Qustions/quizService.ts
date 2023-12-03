import {
  AnswerViewModel,
  CreateAnswerDTO,
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayer,
} from './questionDTO';
import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizRepository } from './QuizRepository';
import { GameEntity, PlayerInformation } from './Entitys/GameEntity';
import { randomUUID } from 'crypto';
import { answerStatusesEnum, gameStatusesEnum } from './questionEnum';
import { mapKuiz } from './mapKuiz';

@Injectable()
export class QuizService {
  constructor(private readonly quizRepository: QuizRepository) {}

  private async createGame(
    player: PlayerInformation,
  ) /*: Promise<GamePairViewModel> */ {
    const game: GameEntity = {
      id: randomUUID(),
      firstPlayerId: player.playerId,
      firstPlayerLogin: player.playerLogin,
      firstPlayerScore: 0,
      firstPlayerAnswers: [],
      secondPlayerId: null,
      secondPlayerLogin: null,
      secondPlayerScore: 0,
      secondPlayerAnswers: [],
      questions: [],
      status: gameStatusesEnum.PendingSecondPlayer,
      pairCreatedDate: new Date().toISOString(),
      startGameDate: null,
      finishGameDate: null,
    };
    await this.quizRepository.createGame(game);
    return game;
  }
  async connectionGame(
    player: PlayerInformation,
  ): Promise<GamePairViewModelPendingSecondPlayer | GamePairViewModel> {
    const activeGamePlayer = await this.checkActiveGamePlayer(player);
    if (!activeGamePlayer) {
      console.log('tyt vylitaem');
      throw new ForbiddenException(
        'est ActiveGame/ connectionGame/quizService',
      );
    }
    const getGamesAwaitPlayer = await this.quizRepository.getGameAwaitPlayer();
    if (getGamesAwaitPlayer.length < 1) {
      console.log('CreateGame');
      const game: GameEntity = await this.createGame(player);
      const gameAwaitPlayer: GamePairViewModelPendingSecondPlayer =
        mapKuiz.mapGamePairViewModelPendingSecondPlayer(game);
      return gameAwaitPlayer;
    }
    if (
      getGamesAwaitPlayer.length === 1 &&
      getGamesAwaitPlayer[0].firstPlayerId === player.playerId
    ) {
      const gameAwaitPlayer: GamePairViewModelPendingSecondPlayer =
        mapKuiz.mapGamePairViewModelPendingSecondPlayer(getGamesAwaitPlayer[0]);
      return gameAwaitPlayer;
    }
    const gameAwait: GameEntity = getGamesAwaitPlayer[0];
    const updateGameForSecondPlayer =
      await this.quizRepository.updateGameAfterConnectionPlayer(
        gameAwait.id,
        player,
      );
    const game = await this.quizRepository.getGame(gameAwait.id);
    if (!game) {
      throw new NotFoundException('gameId not found game /gameService');
    }
    console.log(game);
    const gamesViewModelModel = mapKuiz.mapGamesViewModel(game);
    return gamesViewModelModel[0];
  }
  async checkActiveGamePlayer(player: PlayerInformation): Promise<boolean> {
    const getGamesAwaitPlayer =
      await this.quizRepository.getActiveGameForPlayer(player);
    if (getGamesAwaitPlayer.length < 1) {
      return true;
    }
    return false;
  }
  async getGameNotFinished(
    player: PlayerInformation,
  ): Promise<GamePairViewModel> {
    const games = await this.quizRepository.getGameNotFinished(player);
    if (games.length < 1) {
      throw new NotFoundException(
        'game not found for user, questionService/getGameNotFinished',
      );
    }
    const game: GamePairViewModel[] = mapKuiz.mapGamesViewModel(games);
    return game[0];
  }

  async getGame(gameId: string, player: PlayerInformation) {
    const games = await this.quizRepository.getGame(gameId);
    if (games.length < 1) {
      throw new NotFoundException(
        'game not found for user, questionService/getGameNotFinished',
      );
    }
    if (
      games[0].firstPlayerId !== player.playerId ||
      games[0].secondPlayerId !== player.playerId
    ) {
      throw new ForbiddenException('cheshay Game/ getGame/quizService');
    }
    const game: GamePairViewModel[] = mapKuiz.mapGamesViewModel(games);
    return game[0];
  }

  async createAnswer(
    player: PlayerInformation,
    createAnswerDTO: CreateAnswerDTO,
  ): Promise<AnswerViewModel> {
    const getGames = await this.quizRepository.getActiveGameForPlayer(player);
    const countAnswer = 5;
    if (getGames.length < 1) {
      throw new ForbiddenException(
        'noActiveGameForUser / createAnswer/quizService',
      );
    }
    const game = getGames[0];
    //checkNaLishnieOtvety
    if (game.firstPlayerId === player.playerId) {
      if (game.firstPlayerAnswers.length > countAnswer - 1) {
        throw new ForbiddenException('answerLength / createAnswer/quizService');
      }
      const questionForAnswer = game.questions[game.firstPlayerAnswers.length];
      const answerStatus =
        questionForAnswer.correctAnswers.includes(createAnswerDTO.answer) ===
        true
          ? answerStatusesEnum.Correct
          : answerStatusesEnum.Incorrect;
      if (answerStatus === answerStatusesEnum.Correct) {
        game.firstPlayerScore = game.firstPlayerScore + 1;
      }
      //***
      if (
        game.firstPlayerScore > 0 ||
        (game.secondPlayerScore > 0 &&
          game.firstPlayerAnswers.length === countAnswer - 1 &&
          game.secondPlayerAnswers.length === countAnswer)
      ) {
        game.secondPlayerScore = game.secondPlayerScore + 1;
      }
      //***
      const answerViewModel: AnswerViewModel = {
        answerStatus: answerStatus,
        addedAt: new Date().toISOString(),
        questionId: questionForAnswer.id,
      };
      game.firstPlayerAnswers.push(answerViewModel);
      if (
        game.firstPlayerAnswers.length === countAnswer &&
        game.secondPlayerAnswers.length === countAnswer
      ) {
        (game.status = gameStatusesEnum.Finished),
          (game.finishGameDate = new Date().toISOString());
      }
      await this.quizRepository.updateGameAfterAnswerPlayer(game);
      return answerViewModel;
    }
    if (game.secondPlayerAnswers.length > countAnswer - 1) {
      throw new ForbiddenException(
        'noActiveGameForUser / createAnswer/quizService',
      );
    }
    const questionForAnswer = game.questions[game.secondPlayerAnswers.length];
    const answerStatus =
      questionForAnswer.correctAnswers.includes(createAnswerDTO.answer) === true
        ? answerStatusesEnum.Correct
        : answerStatusesEnum.Incorrect;
    if (answerStatus === answerStatusesEnum.Correct) {
      game.secondPlayerScore = game.secondPlayerScore + 1;
    }
    ///***
    if (
      game.firstPlayerScore > 0 ||
      (game.secondPlayerScore > 0 &&
        game.secondPlayerAnswers.length === countAnswer - 1 &&
        game.firstPlayerAnswers.length === countAnswer)
    ) {
      game.firstPlayerScore = game.firstPlayerScore + 1;
    }
    ///***
    const answerViewModel: AnswerViewModel = {
      answerStatus: answerStatus,
      addedAt: new Date().toISOString(),
      questionId: questionForAnswer.id,
    };
    game.secondPlayerAnswers.push(answerViewModel);
    if (
      game.firstPlayerAnswers.length === countAnswer &&
      game.secondPlayerAnswers.length === countAnswer
    ) {
      (game.status = gameStatusesEnum.Finished),
        (game.finishGameDate = new Date().toISOString());
    }
    await this.quizRepository.updateGameAfterAnswerPlayer(game);
    return answerViewModel;
  }
  // checkDateMostFastPlayer(
  //   player1Date: AnswerViewModel[],
  //   player2Date: AnswerViewModel[],
  // ) {
  //   const coinFastAnswer = 0;
  //   for (let x = 0; x < player1Date.length; x++) {
  //     console.log(player1Date[x].addedAt);
  //     console.log(player2Date[x].addedAt);
  //     console.log(player1Date[x].addedAt < player2Date[x].addedAt);
  //     //   if (player1Date[x] < player2Date[x]) {
  //     //     console.log(pl)
  //     //     coinFastAnswer++;
  //     //   }
  //   }
  //   return true;
  // }
}
