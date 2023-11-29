import { GameEntityType } from "./Entitys/GameEntity";
import { randomUUID } from "crypto";
import { gameStatusesEnum } from "./questionEnum";
import { PlayerEntityType } from "./Entitys/PlayerEntity";
import { mapKuiz } from "./mapKuiz";
import { GamePairViewModel, GamePairViewModelPendingSecondPlayer } from "./questionDTO";
import { Injectable, NotFoundException } from "@nestjs/common";
import { QuizRepository } from "./QuizRepository";


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
// private async createGame(
//   playerAwaitGame: PlayerEntityType,
//   player: PlayerEntityType,
// ): Promise<GamePairViewModel> {
//   const game: GameEntityType = {
//     id: playerAwaitGame.gameId,
//     status: gameStatusesEnum.Active,
//     pairCreatedDate: playerAwaitGame.playerPairCreatedDate,
//     startGameDate: new Date().toISOString(),
//     finishGameDate: null,
//   };
//   await this.questionsRepository.createGame(game);
//   const questionsViewModel =
//     await this.questionsRepository.getRandomQuestionsAmount();
//   const gameViewModel: GamePairViewModel = mapKuiz.mapGameViewModel(
//     playerAwaitGame,
//     player,
//     game,
//     questionsViewModel,
//   );
//   return gameViewModel;
// }
async connectionGame(
  user,
): Promise<GamePairViewModelPendingSecondPlayer | GamePairViewModel> {
  const getPlayerAwaitGame =
    await this.quizRepository.getGameAwaitPlayer();
  console.log('await Players');
  console.log(getPlayerAwaitGame);
  if (getPlayerAwaitGame.length < 1) {
  console.log('CreatePlayerAwaitGame');
  return this.createPlayerAwaitGame(user);
}
const player: PlayerEntityType = {
  gameId: getPlayerAwaitGame[0].gameId,
  playerId: user.id,
  playerLogin: user.login,
  playerScore: 0,
  playerAnswers: [],
  status: gameStatusesEnum.Active,
};
console.log('player for game');
console.log(player);
await this.questionsRepository.createPlayer(player);
const updateStatusAwaitUser =
  await this.questionsRepository.updatePlayerStatus(
    getPlayerAwaitGame[0].playerId,
  );
if (!updateStatusAwaitUser) {
  throw new NotFoundException(
    'awaitUser not found for update, questionService ,connectionGame',
  );
}
const updateGameStatus = await this.questionsRepository.updateGameStatus(
  player.gameId,
  gameStatusesEnum.Active,
);
return;
}
async getGameNotFinished(userId: string) /*Promise<GamePairViewModel>*/ {
  const game = await this.questionsRepository.getGameNotFinished(userId);
  if (!game) {
    throw new NotFoundException(
      'game not found fr user, questionService ,getGameNotFinished',
    );
  }
  return game;
}
