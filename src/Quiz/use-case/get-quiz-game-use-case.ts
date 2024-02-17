import { PlayerInformation } from '../Game.Entity';
import { CommandHandler } from '@nestjs/cqrs';
import { QuizRepository } from '../quizRepository';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayerViewModel,
} from '../gameDTO';
import { isUUID } from 'class-validator';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { mapKuiz } from '../mapKuiz';

export class GetQuizGameUseCaseCommand {
  constructor(public gameId: string, public player: PlayerInformation) {}
}
@CommandHandler(GetQuizGameUseCaseCommand)
export class GetQuizGameUseCase {
  constructor(public quizRepository: QuizRepository) {}
  async execute(
    command: GetQuizGameUseCaseCommand,
  ): Promise<
    GamePairViewModel | GamePairViewModelPendingSecondPlayerViewModel
  > {
    if (isUUID(command.gameId) === false) {
      throw new BadRequestException(
        'gameId not found question /quizService/getGame',
      );
    }
    const games = await this.quizRepository.getGame(command.gameId);
    if (games.length < 1) {
      throw new NotFoundException(
        'game not found for user, questionService/getGameNotFinished',
      );
    }
    if (
      games[0].firstPlayerId !== command.player.playerId &&
      games[0].secondPlayerId !== command.player.playerId
    ) {
      throw new ForbiddenException('cheshay Quiz/ getGame/quizService');
    }
    if (games[0].startGameDate === null) {
      const game: GamePairViewModelPendingSecondPlayerViewModel =
        mapKuiz.mapGamePairViewModelPendingSecondPlayer(games[0]);
      return game;
    }
    const game: GamePairViewModel[] = mapKuiz.mapGamesViewModel(games);
    return game[0];
  }
}
