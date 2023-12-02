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
import { publishedStatusEnum } from './questionEnum';
import { mapObject } from '../mapObject';
import { mapKuiz } from './mapKuiz';
import { GameEntity } from './Entitys/GameEntity';

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
    console.log(questions);
    const questionsRandom: QuestionEntity[] = [];
    for (let x = 0; x < 5; x++) {
      const question =
        questions[helper.getRandomIntInclusive(0, questions.length)];
      if (questions.length > 5) {
        if (questionsRandom.includes(question) === true) {
          x--;
          break;
        }
        questionsRandom.push(question);
        break;
      }
      questionsRandom.push(question);
    }
    console.log('questionsRandom');
    console.log(questionsRandom);
    const questionsViewModel: QuestionViewModel[] =
      mapKuiz.mapQuestionsViewModel(questionsRandom);
    console.log('questionsViewModel');
    console.log(questionsViewModel);
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
}
