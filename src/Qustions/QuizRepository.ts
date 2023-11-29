import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlayerEntity, PlayerEntityType } from './Entitys/PlayerEntity';
import { GameEntity, GameEntityType } from './Entitys/GameEntity';
import { gameStatusesEnum } from './questionEnum';
import { mapObject } from '../mapObject';
import { mapKuiz } from './mapKuiz';

export class QuizRepository {
  constructor(
    @InjectRepository(GameEntity)
    protected gameRepositoryTypeOrm: Repository<GameEntity>,
  ) {}
  // async createPlayer(player: PlayerEntityType) {
  //   return await this.playerRepositoryTypeOrm.save(player);
  // }

  async getGameAwaitPlayer() {
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    const gameSql = await qbGame
      .where('status = :status', {
        status: gameStatusesEnum.PendingSecondPlayer,
      })
      .getRawMany();
    const gamesEntity = mapObject.mapRawManyQBOnTableName(gameSql, [
      'game' + '_',
    ]);
    const playersEntity = mapKuiz.mapPlayersEntity(gamesEntity);
    return playersEntity;
  }
  async createGame(game: GameEntityType) {
    return await this.gameRepositoryTypeOrm.save(game);
  }

  async getGameNotFinished(userId: string) {
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('g');
    const qbQuestion = await this.questionRepositoryTypeOrm.createQueryBuilder(
      'q',
    );

    const take = await qbGame
      .leftJoinAndSelect('g.players', 'uGP')
      .getRawMany();

    //.where('')
    //.addWhere('status = :status', { status: gameStatusesEnum.Active })
    //.andWhere('status = :status', { status: gameStatusesEnum.Finished })
    console.log('getGameNotFinished');
    console.log(take);
    if (take.length < 1) {
      const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder(
        'player',
      );
      const playersSql = await qbPlayer
        .where('player.playerId = :playerId', {
          playerId: userId,
        })
        .getRawMany();
      if (playersSql.length < 1) {
        return false;
      }
      const players = mapObject.mapRawManyQBOnTableName(playersSql, [
        'player' + '_',
      ]);
      const playersEntityType = mapKuiz.mapPlayersEntity(players);
      const playerGamePairViewModelPendingSecondPlayer =
        mapKuiz.mapGamePairViewModelPendingSecondPlayer(playersEntityType[0]);
      return playerGamePairViewModelPendingSecondPlayer;
    }
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
    return true;
  }

  async updatePlayerStatus(playerId: string) {
    const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder(
      'player',
    );
    const update = await qbPlayer
      .update(PlayerEntity)
      .set({
        status: gameStatusesEnum.Active,
      })
      .where('player.playerId = :playerId', {
        playerId: playerId,
      })
      .execute();
    if (!update.affected) {
      return false;
    }
    return true;
  }
}
