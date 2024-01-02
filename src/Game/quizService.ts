import { AnswerViewModel, CreateAnswerDTO } from '../Qustions/questionDTO';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QuizRepository } from './quizRepository';
import { GameEntity, PlayerInformation } from './GameEntity';
import { randomUUID } from 'crypto';
import { answerStatusesEnum, gameStatusesEnum } from '../Qustions/questionEnum';
import { mapKuiz } from './mapKuiz';
import { isUUID } from 'class-validator';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayerViewModel,
  PaginationGetTopDTO,
  StaticViewModel,
} from './gameDTO';
import { PlayerEntity, updatePlayerStaticAfterGame } from './PlayerEntity';
import { helper } from '../helper';
import { outputModel, PaginationSqlDTO } from '../DTO';

@Injectable()
export class QuizService {
  constructor(private readonly quizRepository: QuizRepository) {}

  private async createGame(player: PlayerInformation): Promise<GameEntity> {
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
  ): Promise<
    GamePairViewModelPendingSecondPlayerViewModel | GamePairViewModel
  > {
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
      const gameAwaitPlayer: GamePairViewModelPendingSecondPlayerViewModel =
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
    console.log('tyt12');
    await this.checkNewPlayer(game[0].firstPlayerId, game[0].firstPlayerLogin);
    await this.checkNewPlayer(
      game[0].secondPlayerId,
      game[0].secondPlayerLogin,
    );
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
  ): Promise<
    GamePairViewModel | GamePairViewModelPendingSecondPlayerViewModel
  > {
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
  ): Promise<
    GamePairViewModel | GamePairViewModelPendingSecondPlayerViewModel
  > {
    if (isUUID(gameId) === false) {
      throw new BadRequestException(
        'gameId not found question /quizService/getGame',
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
      const game: GamePairViewModelPendingSecondPlayerViewModel =
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
      console.log('tyt');
      console.log(questionForAnswer);
      console.log(createAnswerDTO.answer);
      console.log('tyt2');
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
        const updateStaticPlayer = await this.updatePlayerAfterGame(
          gameAddPoint,
        );
        return answerViewModel;
      }
      if (game.secondPlayerAnswers.length === countAnswer) {
        setTimeout(async () => {
          await this.finishGameForSlowPlayer(player);
        }, 10000);
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
    console.log('tyt');
    console.log(questionForAnswer);
    console.log(createAnswerDTO.answer);
    console.log('tyt2');
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
    if (game.secondPlayerAnswers.length === countAnswer) {
      setTimeout(async () => {
        await this.finishGameForSlowPlayer(player);
      }, 10000);
    }
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
      const updateStaticPlayer = await this.updatePlayerAfterGame(gameAddPoint);
      return answerViewModel;
    }
    if (game.secondPlayerAnswers.length === countAnswer) {
      setTimeout(async () => {
        await this.finishGameForSlowPlayer(player);
      }, 10000);
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
        game.firstPlayerScore > 0 &&
        game.firstPlayerAnswers[countAnswer - 1].addedAt <
          game.secondPlayerAnswers[countAnswer - 1].addedAt
      ) {
        game.firstPlayerScore = game.firstPlayerScore + 1;
      } else {
        if (game.secondPlayerScore > 0) {
          game.secondPlayerScore = game.secondPlayerScore + 1;
        }
      }
      (game.status = gameStatusesEnum.Finished),
        (game.finishGameDate = new Date().toISOString());

      return game;
    } else {
      if (
        game.secondPlayerScore > 0 &&
        game.secondPlayerAnswers[countAnswer - 1].addedAt <
          game.firstPlayerAnswers[countAnswer - 1].addedAt
      ) {
        game.secondPlayerScore = game.secondPlayerScore + 1;
      } else {
        if (game.firstPlayerScore > 0) {
          game.firstPlayerScore = game.firstPlayerScore + 1;
        }
      }
      (game.status = gameStatusesEnum.Finished),
        (game.finishGameDate = new Date().toISOString());
    }
    return game;
  }

  async getStatisticGameUser(
    player: PlayerInformation,
  ): Promise<StaticViewModel> {
    const playerStatic =
      await this.quizRepository.getStaticGameForStaticViewModel(
        player.playerId,
      );
    if (!playerStatic) {
      const staticPlayerNullGame: StaticViewModel = {
        gamesCount: 0,
        avgScores: 0,
        winsCount: 0,
        drawsCount: 0,
        lossesCount: 0,
        sumScore: 0,
      };
      return staticPlayerNullGame;
    }
    const staticPlayer = this.getStatisticViewModel(playerStatic);
    return staticPlayer;
  }

  private getStatisticViewModel(player: PlayerEntity): StaticViewModel {
    console.log(player);
    const staticPlayerNullGame: StaticViewModel = {
      gamesCount: player.games,
      avgScores: player.avgScores,
      winsCount: player.wins,
      drawsCount: player.draws,
      lossesCount: player.losses,
      sumScore: player.scores,
    };
    return staticPlayerNullGame;
  }

  private async checkNewPlayer(playerId: string | null, login: string | null) {
    if (playerId === null || login === null) {
      throw new BadRequestException(
        'ne dolgen byt tyt,net vtorogo igroka CreatePlayer/quizService',
      );
    }
    const checkPlayer = await this.quizRepository.getPlayerById(playerId);
    if (!checkPlayer) {
      const player: PlayerEntity = {
        id: playerId,
        login: login,
        games: 0,
        scores: 0,
        draws: 0,
        wins: 0,
        losses: 0,
        avgScores: 0,
      };
      const createPlayer = await this.quizRepository.createPlayer(player);
    }
    return;
  }

  private async updatePlayerAfterGame(game: GameEntity) {
    if (game.secondPlayerId === null) {
      throw new BadRequestException(
        'ne dolgen byt tyt,net vtorogo igroka CreatePlayer/quizService',
      );
    }
    const firstPlayerStatic: updatePlayerStaticAfterGame = {
      games: 1,
      scores: game.firstPlayerScore,
      wins: 0,
      draws: 0,
      losses: 0,
    };
    const secondPlayerStatic: updatePlayerStaticAfterGame = {
      games: 1,
      scores: game.secondPlayerScore,
      wins: 0,
      draws: 0,
      losses: 0,
    };

    if (game.firstPlayerScore === game.secondPlayerScore) {
      firstPlayerStatic.draws++;
      secondPlayerStatic.draws++;
    }
    if (game.firstPlayerScore > game.secondPlayerScore) {
      firstPlayerStatic.wins++;
      secondPlayerStatic.losses++;
    }
    if (game.firstPlayerScore < game.secondPlayerScore) {
      secondPlayerStatic.wins++;
      firstPlayerStatic.losses++;
    }
    const updateFirstPlayer = await this.quizRepository.updatePlayerAfterGame(
      firstPlayerStatic,
      game.firstPlayerId,
    );
    const updateSecondPlayer = await this.quizRepository.updatePlayerAfterGame(
      secondPlayerStatic,
      game.secondPlayerId,
    );
    console.log(updateFirstPlayer);
    console.log(updateSecondPlayer);
    if (!updateFirstPlayer || !updateSecondPlayer) {
      throw new NotFoundException(
        'ne obnovilas statistika igroka updatePlayerAfterGame/quizService',
      );
    }
  }

  async getGames(
    player: PlayerInformation,
    gamePaginationDTO: PaginationSqlDTO,
  ): Promise<outputModel<GamePairViewModel>> {
    const pagination = helper.getGamesPaginationDTO(gamePaginationDTO);
    const games = await this.quizRepository.getGames(player, pagination);
    return games;
  }

  async getTopUsersStatistic(topPaginationDTO: PaginationGetTopDTO) {
    const pagination = helper.getTopUserPaginationDTO(topPaginationDTO);
    console.log(pagination);
    const topUserStatistic = await this.quizRepository.getStatisticTopUser(
      pagination,
    );
    return topUserStatistic;
  }

  async finishGameForSlowPlayer(player: PlayerInformation) {
    const getGames = await this.quizRepository.getActiveGameForPlayer(player);
    const countAnswer = 5;
    if (getGames.length < 1) {
      throw new ForbiddenException(
        'noActiveGameForUser / createAnswer/quizService',
      );
    }
    const game = getGames[0];
    const answersPlayer =
      game.firstPlayerId === player.playerId
        ? game.secondPlayerAnswers
        : game.firstPlayerAnswers;

    if (answersPlayer.length < countAnswer) {
      let i = answersPlayer.length;
      while (i < countAnswer) {
        answersPlayer.push({
          answerStatus: answerStatusesEnum.Incorrect,
          addedAt: new Date().toISOString(),
          questionId: game.questions[i].id,
        });
        i++;
      }
      console.log(game);
      //await this.quizRepository.updateGameAfterAnswerPlayer(game);
      const gameAddPoint = this.addPointForFastAnswerPlayerInEndGame(
        game,
        countAnswer,
        player.playerId,
      );
      await this.quizRepository.updateGameAfterAnswerPlayer(gameAddPoint);
      const updateStaticPlayer = await this.updatePlayerAfterGame(gameAddPoint);

      console.log('ne yspeli');
      console.log(answersPlayer);
      return;
    }
    console.log('yspeli');
    console.log(answersPlayer);
    return;
  }
}
