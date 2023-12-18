import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { GameEntity, PlayerInformation } from './GameEntity';
import {
  gameStatusesEnum,
  publishedStatusEnum,
} from '../Qustions/questionEnum';
import { mapObject } from '../mapObject';
import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from '../Qustions/questionsRepository';
import { PlayerEntity, updatePlayerStaticAfterGame } from './PlayerEntity';
import { outputModel, PaginationSqlDTO } from '../DTO';
import { UserViewModel } from '../viewModelDTO';
import {
  GamePairViewModel,
  PaginationGetTopDTO,
  TopPlayerViewModel,
} from './gameDTO';
import { helper } from '../helper';
import { mapKuiz } from './mapKuiz';
import { playerStatic } from '../Enum';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(GameEntity)
    protected gameRepositoryTypeOrm: Repository<GameEntity>,
    @InjectRepository(PlayerEntity)
    protected playerRepositoryTypeOrm: Repository<PlayerEntity>,
    @InjectDataSource() private dataSource: DataSource,
    private readonly questionsRepository: QuestionsRepository,
  ) {}

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
    return gamesEntity;
  }
  async createGame(game: GameEntity) {
    return await this.gameRepositoryTypeOrm.save(game);
  }

  async checkActiveAndPendingGamePlayer(player: PlayerInformation) {
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    const gameSql = await qbGame
      .where(
        'NOT status = :status AND (game.firstPlayerId = :firstPlayerId OR game.secondPlayerId = :secondPlayerId)',
        {
          status: gameStatusesEnum.Finished,
          firstPlayerId: player.playerId,
          secondPlayerId: player.playerId,
        },
      )
      .getRawMany();
    const gamesEntity: GameEntity[] = mapObject.mapRawManyQBOnTableName(
      gameSql,
      ['game' + '_'],
    );
    console.log(gamesEntity);
    return gamesEntity;
  }
  async getGame(gameId: string) {
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    const gameSql = await qbGame
      .where('id = :id', {
        id: gameId,
      })
      .getRawMany();
    const gamesEntity: GameEntity[] = mapObject.mapRawManyQBOnTableName(
      gameSql,
      ['game' + '_'],
    );
    console.log(gamesEntity);
    return gamesEntity;
  }

  async updateGameAfterConnectionPlayer(
    idGame: string,
    player: PlayerInformation,
  ) {
    const questions = await this.questionsRepository.getRandomQuestionsAmount();
    console.log('questions');
    console.log(questions);
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    console.log('update');
    const update = await qbGame
      .update(GameEntity)
      .set({
        questions: questions,
        secondPlayerId: player.playerId,
        secondPlayerLogin: player.playerLogin,
        startGameDate: new Date().toISOString(),
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

  async updateGameAfterAnswerPlayer(game: GameEntity) {
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    console.log('updateGameAfterAnswerPlayer');
    const update = await qbGame
      .update(GameEntity)
      .set({
        firstPlayerScore: game.firstPlayerScore,
        firstPlayerAnswers: game.firstPlayerAnswers,
        secondPlayerScore: game.secondPlayerScore,
        secondPlayerAnswers: game.secondPlayerAnswers,
        status: game.status,
        finishGameDate: game.finishGameDate,
      })
      .where('id = :id', {
        id: game.id,
      })
      .execute();
    console.log('update finished');
    if (!update.affected) {
      return false;
    }
    return true;
  }
  async getActiveGameForPlayer(player: PlayerInformation) {
    console.log(player.playerId);
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');
    const gameSql = await qbGame
      .where(
        'game.status = :status AND (game.firstPlayerId = :firstPlayerId OR game.secondPlayerId = :secondPlayerId)',
        {
          status: gameStatusesEnum.Active,
          firstPlayerId: player.playerId,
          secondPlayerId: player.playerId,
        },
      )
      .getRawMany();
    const gamesEntity: GameEntity[] = mapObject.mapRawManyQBOnTableName(
      gameSql,
      ['game' + '_'],
    );
    console.log(gamesEntity);
    return gamesEntity;
  }

  async getStaticGameForStaticViewModel(playerId: string) {
    const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder(
      'player',
    );
    const player = await qbPlayer
      .where('id = :id', {
        id: playerId,
      })
      .getOne();
    return player;
  }

  async getPlayerById(playerId: string) {
    const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder(
      'player',
    );
    const player = await qbPlayer
      .where('id = :id', {
        id: playerId,
      })
      .getOne();
    return player;
  }

  async createPlayer(player: PlayerEntity) {
    return await this.playerRepositoryTypeOrm.save(player);
  }

  async updatePlayerAfterGame(
    playerStatic: updatePlayerStaticAfterGame,
    playerId: string,
  ) {
    console.log('updatePlayerAfterGame');
    // const qbPlayer = await this.playerRepositoryTypeOrm
    //   .createQueryBuilder('player')
    //   .setLock('pessimistic_write');

    const queryRunner = await this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.startTransaction();
      const findPlayer = await queryRunner.manager
        .getRepository(PlayerEntity)
        .createQueryBuilder('player')
        .useTransaction(true)
        .setLock('pessimistic_write')
        .where('id = :id', { id: playerId })
        .getOne();
      if (!findPlayer) {
        return false;
      }
      const avgScoresDouble =
        (playerStatic.scores + findPlayer.scores) /
        (playerStatic.games + findPlayer.games);
      console.log(avgScoresDouble);
      const avgScoresFinish = Number(avgScoresDouble.toFixed(2));
      console.log('avgSores');
      console.log(avgScoresFinish);

      const updateResult: any = await queryRunner.manager
        .getRepository(PlayerEntity)
        .createQueryBuilder('player')
        .update()
        .set({
          games: () => `games + ${playerStatic.games}`,
          scores: () => `scores + ${playerStatic.scores}`,
          wins: () => `wins + ${playerStatic.wins}`,
          draws: () => `draws + ${playerStatic.draws}`,
          losses: () => `losses + ${playerStatic.losses}`,
          avgScores: avgScoresFinish,
        })
        .where('id = :id', { id: playerId })
        .execute();
      await queryRunner.commitTransaction();
      return updateResult;
    } catch (e) {
      ('rollback');
      await queryRunner.rollbackTransaction();
    } finally {
      ('realase');
      await queryRunner.release();
      return true;
    }
    //.whereInIds(feedIds)
    //     .set({ viewCount: () => 'viewCount + :x' })
    //     .setParameter("x", x)
  }

  async getGames(
    player: PlayerInformation,
    pagination: PaginationSqlDTO,
  ): Promise<outputModel<GamePairViewModel>> {
    console.log('getGamesttt');
    const qbGame = await this.gameRepositoryTypeOrm.createQueryBuilder('game');

    const filter = {
      where:
        'game.firstPlayerId = :firstPlayerId OR game.secondPlayerId = :secondPlayerId',
      params: {
        firstPlayerId: player.playerId,
        secondPlayerId: player.playerId,
      },
    };
    const countGames = await qbGame
      .where(filter.where, filter.params)
      .getCount();

    const sortDirection = pagination.sortDirection == 'asc' ? 'ASC' : 'DESC';
    const paginationFromHelperForQuestion =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countGames,
      );

    const zaprosQb = await qbGame
      .orderBy('game.' + pagination.sortBy, sortDirection)
      .addOrderBy('game.pairCreatedDate', 'DESC')
      .limit(pagination.pageSize)
      .offset(paginationFromHelperForQuestion.skipPage)
      .getMany();
    console.log(zaprosQb);
    const gamesViewModelModel = mapKuiz.mapGamesViewModel(zaprosQb);

    return {
      pagesCount: paginationFromHelperForQuestion.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countGames,
      items: gamesViewModelModel,
    };
  }
  getOrderFilter(sort: string) {
    //const zaprosSortBy = '';
    const arr: { name: string; sort: string }[] = [];
    const inputParamsOrder = sort.split(',');
    for (const inputParam of inputParamsOrder) {
      console.log(inputParam.split(' ')[1]);
      if (
        (inputParam.split(' ')[1] === 'desc' ||
          inputParam.split(' ')[1] === 'asc') &&
        Object.keys(playerStatic).includes(inputParam.split(' ')[0])
      ) {
        arr.push({
          name: playerStatic[inputParam.split(' ')[0]],
          sort: inputParam.split(' ')[1].toUpperCase(),
        });
      }
    }
    console.log(arr);
    return arr;
  }
  async getStatisticTopUser(
    pagination: PaginationGetTopDTO,
  ): Promise<outputModel<TopPlayerViewModel>> {
    const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder();
    const sortBy = this.getOrderFilter(pagination.sort);
    const countPlayers = await qbPlayer.getCount();

    const paginationFromHelperForQuestion =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countPlayers,
      );

    const orderBySort = sortBy.reduce((acc, item) => {
      acc[`"${item.name}"`] = item.sort;
      return acc;
    }, {});

    const zaprosQb = await qbPlayer
      .orderBy(orderBySort)
      .limit(pagination.pageSize)
      .offset(paginationFromHelperForQuestion.skipPage)
      .getMany();
    console.log(zaprosQb);

    const playersTopViewModel = mapKuiz.mapTopPlayerViewModel(zaprosQb);

    return {
      pagesCount: paginationFromHelperForQuestion.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countPlayers,
      items: playersTopViewModel,
    };
  }
}
