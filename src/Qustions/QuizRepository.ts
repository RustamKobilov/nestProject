import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GameEntity, PlayerInformation } from './Entitys/GameEntity';
import { gameStatusesEnum } from './questionEnum';
import { mapObject } from '../mapObject';
import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from './questionsRepository';

@Injectable()
export class QuizRepository {
  constructor(
    @InjectRepository(GameEntity)
    protected gameRepositoryTypeOrm: Repository<GameEntity>,
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
      // .where(
      //   'game.firstPlayerId = :firstPlayerId OR game.secondPlayerId = :secondPlayerId',
      //   {
      //     firstPlayerId: player.playerId,
      //     secondPlayerId: player.playerId,
      //   },
      // )
      // .andWhere('NOT status = :status', {
      //   status: gameStatusesEnum.Finished,
      // })
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
    //const dateNow = new Date().toISOString();
    //console.log(dateNow);
    //TODO как он не успевает с датой, убрать консоль лог и он не работает?
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
      // .where(
      //   'game.firstPlayerId = :firstPlayerId OR game.secondPlayerId = :secondPlayerId',
      //   {
      //     firstPlayerId: player.playerId,
      //     secondPlayerId: player.playerId,
      //   },
      //)
      .getRawMany();
    const gamesEntity: GameEntity[] = mapObject.mapRawManyQBOnTableName(
      gameSql,
      ['game' + '_'],
    );
    console.log(gamesEntity);
    return gamesEntity;
  }
}
