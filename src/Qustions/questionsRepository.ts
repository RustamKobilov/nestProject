import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { Injectable } from '@nestjs/common';
import { QuestionsPaginationDTO } from './questionDTO';
import { helper } from '../helper';

@Injectable()
export class QuestionsRepository {
  constructor(
    @InjectRepository(QuestionEntity)
    private readonly questionRepositoryTypeOrm: Repository<QuestionEntity>,
  ) {}

  async createQuestion(question: QuestionEntity) {
    return await this.questionRepositoryTypeOrm.save(question);
  }

  async getQuestions(pagination: QuestionsPaginationDTO) {
    const countQuestion = await this.questionRepositoryTypeOrm.count({});
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countQuestion,
      );

    const getQuestions = await this.questionRepositoryTypeOrm.find();
    //findAndCount(
    //         {
    //             where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
    //             take: take,
    //             skip: skip
    //         }
    //     );
    return true;
  }
}
