import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { Injectable } from '@nestjs/common';
import {
  CreateQuestionDTO,
  mapQuestion,
  QuestionsPaginationDTO,
} from './questionDTO';
import { helper } from '../helper';
import { publishedStatusEnum } from './questionEnum';
import { mapObject } from '../mapObject';
import { PostEntity } from '../Post/Post.Entity';

enum SortBy {
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  id = 'id',
}

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    protected questionRepositoryTypeOrm: Repository<QuestionEntity>,
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
    const question = await qbQuestion
      .where('id = :id', { id: questionId })
      .getRawMany();
    return question;
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
