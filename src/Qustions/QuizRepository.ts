import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity, PlayerInformation } from './Entitys/GameEntity';
import { gameStatusesEnum } from './questionEnum';
import { mapObject } from '../mapObject';
import { Injectable } from '@nestjs/common';
import { mapKuiz } from './mapKuiz';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { QuestionsRepository } from './questionsRepository';
@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(GameEntity)
    protected gameRepositoryTypeOrm: Repository<GameEntity>,
    private readonly questionsRepository: QuestionsRepository,
  ) {}
  // async createPlayer(player: PlayerEntityType) {
  //   return await this.playerRepositoryTypeOrm.save(player);
  // }

  async getGameAwaitPlayer(): Promise<GameEntity[]> {
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    const gameSql = await qbGame
      .where('status = :status', {
        status: gameStatusesEnum.PendingSecondPlayer,
      })
      .getRawMany();
    const gamesEntity: GameEntity[] = mapObject.mapRawManyQBOnTableName(
      gameSql,
      ['game' + '_'],
    );
    console.log(gamesEntity);
    // const gameViewModelModel = mapKuiz.mapGameViewModel(gamesEntity);
    return gamesEntity;
  }
  async createGame(game: GameEntity) {
    return await this.gameRepositoryTypeOrm.save(game);
  }

  // async getGameNotFinished(userId: string) {
  //   const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('g');
  //   const qbQuestion = await this.questionRepositoryTypeOrm.createQueryBuilder(
  //     'q',
  //   );
  //
  //   const take = await qbGame
  //     .leftJoinAndSelect('g.players', 'uGP')
  //     .getRawMany();

  //.where('')
  //.addWhere('status = :status', { status: gameStatusesEnum.Active })
  //.andWhere('status = :status', { status: gameStatusesEnum.Finished })
  // console.log('getGameNotFinished');
  // console.log(take);
  // if (take.length < 1) {
  //   const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder(
  //     'player',
  //   );
  //   const playersSql = await qbPlayer
  //     .where('player.playerId = :playerId', {
  //       playerId: userId,
  //     })
  //     .getRawMany();
  //   if (playersSql.length < 1) {
  //     return false;
  //   }
  //   const players = mapObject.mapRawManyQBOnTableName(playersSql, [
  //     'player' + '_',
  //   ]);
  //   const playersEntityType = mapKuiz.mapPlayersEntity(players);
  //   const playerGamePairViewModelPendingSecondPlayer =
  //     mapKuiz.mapGamePairViewModelPendingSecondPlayer(playersEntityType[0]);
  //   return playerGamePairViewModelPendingSecondPlayer;
  // }
  //where('id = :id', { id: userId });
  // .leftJoinAndSelect('p.Players', 'uGP')
  // .where('id = :id', { id: userId })
  // .getRawMany();
  //sort playerjoin
  //const questionSql = await qbGame
  //.where('id = :id', { id: questionId })
  //.getRawMany();
  //const question = mapObject.mapRawManyQBOnTableName(questionSql, [
  //  'q' + '_',
  // ]);
  //  const questionViewModel = mapKuiz.mapSaQuestionsViewModel(question);
  //  return questionViewModel;
  //   return true;
  // }

  // async updatePlayerStatus(playerId: string) {
  //   const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder(
  //     'player',
  //   );
  //   const update = await qbPlayer
  //     .update(PlayerEntity)
  //     .set({
  //       status: gameStatusesEnum.Active,
  //     })
  //     .where('player.playerId = :playerId', {
  //       playerId: playerId,
  //     })
  //     .execute();
  //   if (!update.affected) {
  //     return false;
  //   }
  //   return true;
  // }
  async updateGameAfterConnectionPlayer(
    idGame: string,
    player: PlayerInformation,
  ) {
    const questions = await this.questionsRepository.getRandomQuestionsAmount();
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    console.log('update');
    const dateNow = new Date().toISOString.toString();
    const update = await qbGame
      .update(GameEntity)
      .set({
        questions: questions,
        secondPlayerId: player.playerId,
        secondPlayerLogin: player.playerId,
        startGameDate: new Date().toISOString.toString(),
        status: gameStatusesEnum.Active,
      })
      .where('id = :id', {
        id: idGame,
      })
      .execute();
    console.log('update finished');
    if (!update.affected) {
      return false;
    }
    return true;
  }

  async getGame(idGame: string): Promise<GameEntity | false> {
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    const gameSql = await qbGame
      .where('id = :id', {
        id: idGame,
      })
      .getRawMany();
    if (gameSql.length < 1) {
      return false;
    }
    const gamesEntity: GameEntity[] = mapObject.mapRawManyQBOnTableName(
      gameSql,
      ['game' + '_'],
    );
    return gamesEntity[0];
  }
}
