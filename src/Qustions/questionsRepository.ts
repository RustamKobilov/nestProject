import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from './Question.Entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateQuestionDTO,
  mapQuestion,
  QuestionsPaginationDTO,
  QuestionViewModel,
  SaQuestionViewModel,
} from './questionDTO';
import { helper } from '../helper';
import { publishedStatusEnum } from './questionEnum';
import { mapObject } from '../mapObject';
import { mapKuiz } from '../Quiz/mapKuiz';
import { GameEntity, QuestionInGameEntityType } from '../Quiz/Game.Entity';
import { outputModel } from '../DTO';
import { GamePairViewModel } from '../Quiz/gameDTO';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    protected questionRepositoryTypeOrm: Repository<QuestionEntity>,
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

  async getQuestions(
    pagination: QuestionsPaginationDTO,
  ): Promise<outputModel<SaQuestionViewModel>> {
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
    const questionsSql = mapObject.mapRawManyQBOnTableNameIsNotNull(zaprosQb, [
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

  async getRandomQuestionsAmount(): Promise<QuestionInGameEntityType[] | []> {
    const amountQuestions = 5;
    const questions = await this.questionRepositoryTypeOrm.find({
      where: {
        published: true,
      },
    });
    console.log(questions);
    if (questions.length < 1) {
      throw new NotFoundException(
        'questions not found getRandomQuestionsAmount /questionRepository',
      );
    }
    const questionsRandom: QuestionEntity[] = [];
    for (let x = 0; x < amountQuestions; x++) {
      console.log(x);
      const question =
        questions[helper.getRandomIntInclusive(0, questions.length - 1)];
      if (questions.length < amountQuestions) {
        questionsRandom.push(question);
      }
      if (questionsRandom.includes(question) === true) {
        x--;
      } else {
        questionsRandom.push(question);
      }
    }
    console.log('questionsRandom');
    console.log(questionsRandom);
    const questionsViewModel: QuestionInGameEntityType[] =
      mapKuiz.mapQuestionInGameEntityType(questionsRandom);
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
    const question = mapObject.mapRawManyQBOnTableNameIsNotNull(questionSql, [
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
    const updateDate = new Date().toISOString();
    const update = await qbQuestion
      .update(QuestionEntity)
      .set({
        body: updateQuestionDTO.body,
        correctAnswers: updateQuestionDTO.correctAnswers,
        updatedAt: new Date().toISOString(),
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
        updatedAt: new Date().toISOString(),
      })
      .where('id = :id', { id: questionId })
      .execute();
    if (!update.affected) {
      return false;
    }
    return true;
  }
}
