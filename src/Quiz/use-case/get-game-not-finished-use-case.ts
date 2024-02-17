import { QuizRepository } from '../quizRepository';
import {
  GamePairViewModel,
  GamePairViewModelPendingSecondPlayerViewModel,
} from '../gameDTO';
import { CommandHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { gameStatusesEnum } from '../../Qustions/questionEnum';
import { mapKuiz } from '../mapKuiz';
import { PlayerInformation } from '../Game.Entity';

export class GetGameNotFinishedUseCaseCommand {
  constructor(public player: PlayerInformation) {}
}

@CommandHandler(GetGameNotFinishedUseCaseCommand)
export class GetGameNotFinishedUseCase {
  constructor(public quizRepository: QuizRepository) {}

  async execute(
    command: GetGameNotFinishedUseCaseCommand,
  ): Promise<
    GamePairViewModel | GamePairViewModelPendingSecondPlayerViewModel
  > {
    const games = await this.quizRepository.checkActiveAndPendingGamePlayer(
      command.player,
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
}
