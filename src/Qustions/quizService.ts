import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayer,
} from './questionDTO';
import { Injectable, NotFoundException } from '@nestjs/common';
import { QuizRepository } from './QuizRepository';
import { GameEntity, PlayerInformation } from './Entitys/GameEntity';
import { randomUUID } from 'crypto';
import { gameStatusesEnum } from './questionEnum';
import { mapKuiz } from './mapKuiz';

@Injectable()
export class QuizService {
  constructor(private readonly quizRepository: QuizRepository) {}

  // private async createPlayerAwaitGame(user) {
  //   const game: GameEntityType = {
  //     id: randomUUID(),
  //     status: gameStatusesEnum.PendingSecondPlayer,
  //     pairCreatedDate: new Date().toISOString(),
  //     startGameDate: null,
  //     finishGameDate: null,
  //   };
  //   const player: PlayerEntityType = {
  //     gameId: game.id,
  //     playerId: user.id,
  //     playerLogin: user.login,
  //     playerScore: 0,
  //     playerAnswers: [],
  //     status: gameStatusesEnum.PendingSecondPlayer,
  //   };
  //   await this.questionsRepository.createGame(game);
  //   await this.questionsRepository.createPlayer(player);
  //   const playerGamePairViewModelPendingSecondPlayer =
  //     mapKuiz.mapGamePairViewModelPendingSecondPlayer(player);
  //   return playerGamePairViewModelPendingSecondPlayer;
  // }
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
    //   const questionsViewModel =
    //     await this.questionsRepository.getRandomQuestionsAmount();
    //   const gameViewModel: GamePairViewModel = mapKuiz.mapGameViewModel(
    //     playerAwaitGame,
    //     player,
    //     game,
    //     questionsViewModel,
    //   );
    //   return gameViewModel;
  }
  async connectionGame(
    player: PlayerInformation,
  ): Promise<GamePairViewModelPendingSecondPlayer | GamePairViewModel> {
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
    const gamesViewModelModel = mapKuiz.mapGameViewModel([game]);
    return gamesViewModelModel[0];
  }
  //   console.log('player for game');
  //   console.log(player);
  //   await this.questionsRepository.createPlayer(player);
  //   const updateStatusAwaitUser =
  //     await this.questionsRepository.updatePlayerStatus(
  //       getPlayerAwaitGame[0].playerId,
  //     );
  //   if (!updateStatusAwaitUser) {
  //     throw new NotFoundException(
  //       'awaitUser not found for update, questionService ,connectionGame',
  //     );
  //   }
  //   const updateGameStatus = await this.questionsRepository.updateGameStatus(
  //     player.gameId,
  //     gameStatusesEnum.Active,
  //   );
  //   return;
  // }
  //
  // async getGameNotFinished(userId: string) /*Promise<GamePairViewModel>*/ {
  //   const game = await this.questionsRepository.getGameNotFinished(userId);
  //   if (!game) {
  //     throw new NotFoundException(
  //       'game not found fr user, questionService ,getGameNotFinished',
  //     );
  //   }
  //   return game;
  // }
}
