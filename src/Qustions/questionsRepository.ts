import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { Injectable } from '@nestjs/common';
import {
  CreateQuestionDTO,
  mapQuestion,
  QuestionsPaginationDTO,
  QuestionViewModel,
} from './questionDTO';
import { helper } from '../helper';
import { gameStatusesEnum, publishedStatusEnum } from './questionEnum';
import { mapObject } from '../mapObject';
import { mapKuiz } from './mapKuiz';
import { PlayerEntity, PlayerEntityType } from './Entitys/PlayerEntity';
import { GameEntity, GameEntityType } from './Entitys/GameEntity';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    protected questionRepositoryTypeOrm: Repository<QuestionEntity>,
    @InjectRepository(PlayerEntity)
    protected playerRepositoryTypeOrm: Repository<PlayerEntity>,
    @InjectRepository(GameEntity)
    protected gameRepositoryTypeOrm: Repository<GameEntity>,
  ) {}

  async createQuestion(question: QuestionEntity) {
    return await this.questionRepositoryTypeOrm.save(question);
  }
  getFilterQuestionEntity(
    publishedStatus: publishedStatusEnum,
    bodySearchTerm: string,
  ) {
    if (publishedStatus === publishedStatusEnum.all) {
      return {
        where: 'q.body ilike :bodySearchTerm',
        params: { bodySearchTerm: `%${bodySearchTerm}%` },
      };
    }
    if (publishedStatus === publishedStatusEnum.notPublished) {
      return {
        where: 'q.published :published AND q.body ilike :bodySearchTerm',
        params: {
          publishedStatus: false,
          bodySearchTerm: `%${bodySearchTerm}%`,
        },
      };
    }
    return {
      where: 'q.published :published AND q.body ilike :bodySearchTerm',
      params: {
        publishedStatus: true,
        bodySearchTerm: `%${bodySearchTerm}%`,
      },
    };
  }
  async getQuestions(pagination: QuestionsPaginationDTO) {
    const qbQuestion = await this.questionRepositoryTypeOrm.createQueryBuilder(
      'q',
    );

    console.log(pagination);
    const filter = this.getFilterQuestionEntity(
      pagination.publishedStatus,
      pagination.bodySearchTerm,
    );
    console.log(filter);

    const countQuestions = await qbQuestion
      .where(filter.where, filter.params)
      .getCount();
    console.log(countQuestions);

    const sortDirection = pagination.sortDirection == 'asc' ? 'ASC' : 'DESC';
    const paginationFromHelperForQuestion =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countQuestions,
      );
    // console.log(countQuestion);
    const zaprosQb = await qbQuestion
      .orderBy('q.' + pagination.sortBy, sortDirection)
      .limit(pagination.pageSize)
      .offset(paginationFromHelperForQuestion.skipPage)
      .getRawMany();
    //console.log(zaprosQb);
    const questionsSql = mapObject.mapRawManyQBOnTableName(zaprosQb, [
      'q' + '_',
    ]);
    const questions = mapQuestion.mapQuestionFromSql(questionsSql);
    //console.log('after');
    //console.log(questions);
    // console.log(getQuestions);
    // console.log(getQuestions[0]);
    return {
      pagesCount: paginationFromHelperForQuestion.totalCount,
      page: pagination.pageNumber,
      pageSize: pagination.pageSize,
      totalCount: countQuestions,
      items: questions,
    };
  }
  async getRandomQuestionsAmount(): Promise<QuestionViewModel[]> {
    const questions = await this.questionRepositoryTypeOrm.find({});
    const questionsRandom: QuestionEntity[] = [];
    for (let x = 0; x < 5; x++) {
      questionsRandom.push(
        questions[helper.getRandomIntInclusive(0, questions.length)],
      );
    }
    const questionsViewModel: QuestionViewModel[] =
      mapKuiz.mapQuestionsViewModel(questionsRandom);
    return questionsViewModel;
  }
  async deleteQuestion(questionId: string) {
    const deleteQuestion = await this.questionRepositoryTypeOrm.delete({
      id: questionId,
    });
    console.log(deleteQuestion);
    return true;
  }

  async getQuestionId(questionId: string) {
    const qbQuestion = await this.questionRepositoryTypeOrm.createQueryBuilder(
      'q',
    );
    const questionSql = await qbQuestion
      .where('id = :id', { id: questionId })
      .getRawMany();
    const question = mapObject.mapRawManyQBOnTableName(questionSql, [
      'q' + '_',
    ]);
    const questionViewModel = mapKuiz.mapSaQuestionsViewModel(question);
    return questionViewModel;
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDTO: CreateQuestionDTO,
  ) {
    const qbQuestion = await this.questionRepositoryTypeOrm.createQueryBuilder(
      'q',
    );
    const update = await qbQuestion
      .update(QuestionEntity)
      .set({
        body: updateQuestionDTO.body,
        correctAnswers: updateQuestionDTO.correctAnswers,
        updatedAt: new Date().toISOString,
      })
      .where('id = :id', { id: questionId })
      .execute();
    if (!update.affected) {
      return false;
    }
    return true;
  }

  async updatePublishQuestion(questionId: string, published: boolean) {
    const qbQuestion = await this.questionRepositoryTypeOrm.createQueryBuilder(
      'q',
    );
    const update = await qbQuestion
      .update(QuestionEntity)
      .set({
        published: published,
      })
      .where('id = :id', { id: questionId })
      .execute();
    if (!update.affected) {
      return false;
    }
    return true;
  }

  async createPlayer(player: PlayerEntityType) {
    return await this.playerRepositoryTypeOrm.save(player);
  }

  async getPlayerAwaitGame() {
    const qbPlayer = await this.playerRepositoryTypeOrm.createQueryBuilder(
      'player',
    );
    const playersSql = await qbPlayer
      .where('status = :status', {
        status: gameStatusesEnum.PendingSecondPlayer,
      })
      .getRawMany();
    const players = mapObject.mapRawManyQBOnTableName(playersSql, [
      'player' + '_',
    ]);
    const playersEntity = mapKuiz.mapPlayersEntity(players);
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
