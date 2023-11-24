import { Equal, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { Injectable } from '@nestjs/common';
import { QuestionsPaginationDTO } from './questionDTO';
import { helper } from '../helper';
import { skip, take } from 'rxjs';

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
    const sortDirection = pagination.sortDirection === 1 ? 'ASC' : 'DESC';
    const paginationFromHelperForPosts =
      helper.getPaginationFunctionSkipSortTotal(
        pagination.pageNumber,
        pagination.pageSize,
        countQuestion,
      );

    //const getQuestions = await this.questionRepositoryTypeOrm.find({
    //order: pagination.sortBy : sortDirection,
    //take(pagination.pageSize),
    //skip(paginationFromHelperForPosts.skipPage)
    //})
    //find(order:{pagination.sortBy:sortDirection},);
    //findAndCount(
    //         {
    //             where: { name: Like('%' + keyword + '%') }, order: { name: "DESC" },
    //             take: take,
    //             skip: skip
    //         }
    //     );
    //console.log(getQuestions);
    return true;
  }

  async deleteQuestion(questionId: string) {
    const deleteQuestion = await this.questionRepositoryTypeOrm.delete({
      id: questionId,
    });
    console.log(deleteQuestion);
    return true;
  }
}
