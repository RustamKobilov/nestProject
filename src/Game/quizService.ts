import { AnswerViewModel, CreateAnswerDTO } from '../Qustions/questionDTO';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizRepository } from './QuizRepository';
import { GameEntity, PlayerInformation } from './GameEntity';
import { randomUUID } from 'crypto';
import { answerStatusesEnum, gameStatusesEnum } from '../Qustions/questionEnum';
import { mapKuiz } from './mapKuiz';
import { isUUID } from 'class-validator';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayer,
  StaticViewModel,
} from './gameDTO';

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
    const activeGamePlayer = await this.checkActiveAndPendingGamePlayer(player);
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
  async checkActiveAndPendingGamePlayer(
    player: PlayerInformation,
  ): Promise<boolean> {
    const getGamesAwaitPlayer =
      await this.quizRepository.checkActiveAndPendingGamePlayer(player);
    if (getGamesAwaitPlayer.length < 1) {
      return true;
    }
    return false;
  }
  async getGameNotFinished(
    player: PlayerInformation,
  ): Promise<GamePairViewModel | GamePairViewModelPendingSecondPlayer> {
    const games = await this.quizRepository.checkActiveAndPendingGamePlayer(
      player,
    );
    if (games.length < 1) {
      throw new NotFoundException(
        'game not found for user, questionService/getGameNotFinished',
      );
    }
    if (games[0].status === gameStatusesEnum.PendingSecondPlayer) {
      return mapKuiz.mapGamePairViewModelPendingSecondPlayer(games[0]);
    }
    const game: GamePairViewModel[] = mapKuiz.mapGamesViewModel(games);
    return game[0];
  }

  async getGame(
    gameId: string,
    player: PlayerInformation,
  ): Promise<GamePairViewModel | GamePairViewModelPendingSecondPlayer> {
    //TODO почемутакой тест должен быть так
    if (isUUID(gameId) === false) {
      throw new BadRequestException(
        'questionId not found question /questionService/deleteQuestion',
      );
    }
    const games = await this.quizRepository.getGame(gameId);
    if (games.length < 1) {
      throw new NotFoundException(
        'game not found for user, questionService/getGameNotFinished',
      );
    }
    if (
      games[0].firstPlayerId !== player.playerId &&
      games[0].secondPlayerId !== player.playerId
    ) {
      throw new ForbiddenException('cheshay Game/ getGame/quizService');
    }
    if (games[0].startGameDate === null) {
      const game: GamePairViewModelPendingSecondPlayer =
        mapKuiz.mapGamePairViewModelPendingSecondPlayer(games[0]);
      return game;
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
    /////firstPlayer
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
        console.log('vernyi otvet + 1 firstPlayerScore');
        game.firstPlayerScore = game.firstPlayerScore + 1;
      }
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
        const gameAddPoint = this.addPointForFastAnswerPlayerInEndGame(
          game,
          countAnswer,
          player.playerId,
        );
        await this.quizRepository.updateGameAfterAnswerPlayer(gameAddPoint);
        return answerViewModel;
      }
      await this.quizRepository.updateGameAfterAnswerPlayer(game);
      return answerViewModel;
    }
    ///secondPlayer
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
      console.log('vernyi otvet + 1 secondPlayerScore');
      game.secondPlayerScore = game.secondPlayerScore + 1;
    }
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
      const gameAddPoint = this.addPointForFastAnswerPlayerInEndGame(
        game,
        countAnswer,
        player.playerId,
      );
      await this.quizRepository.updateGameAfterAnswerPlayer(gameAddPoint);
      return answerViewModel;
    }
    await this.quizRepository.updateGameAfterAnswerPlayer(game);
    return answerViewModel;
  }
  private addPointForFastAnswerPlayerInEndGame(
    game: GameEntity,
    countAnswer: number,
    playerId: string,
  ): GameEntity {
    if (game.firstPlayerId === playerId) {
      if (
        game.firstPlayerAnswers.length === countAnswer &&
        game.secondPlayerAnswers.length === countAnswer
      ) {
        if (
          game.firstPlayerScore > 0 &&
          game.firstPlayerAnswers[countAnswer - 1].addedAt <
            game.secondPlayerAnswers[countAnswer - 1].addedAt
        ) {
          game.firstPlayerScore = game.firstPlayerScore + 1;
        } else {
          game.secondPlayerScore = game.secondPlayerScore + 1;
        }
        (game.status = gameStatusesEnum.Finished),
          (game.finishGameDate = new Date().toISOString());
      }
      return game;
    } else {
      if (
        game.secondPlayerScore > 0 &&
        game.secondPlayerAnswers[countAnswer - 1].addedAt <
          game.firstPlayerAnswers[countAnswer - 1].addedAt
      ) {
        game.secondPlayerScore = game.secondPlayerScore + 1;
      } else {
        game.firstPlayerScore = game.firstPlayerScore + 1;
      }
      (game.status = gameStatusesEnum.Finished),
        (game.finishGameDate = new Date().toISOString());
    }
    return game;
  }

  async getStatisticGameUser(
    player: PlayerInformation,
  ) /*: Promise<StaticViewModel> */ {
    await this.quizRepository.getStaticGameForStaticViewModel(player.playerId);
  }
}
