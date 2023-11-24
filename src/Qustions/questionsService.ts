import { QuestionsRepository } from './questionsRepository';
import { Injectable } from '@nestjs/common';
import {
  CreateQuestionDTO,
  QuestionsPaginationDTO,
  QuestionViewModel,
} from './questionDTO';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { randomUUID } from 'crypto';
import { mapQuestions } from './mapQuestions';
import { helper } from '../helper';
@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async createQuestion(
    createQuestionDTO: CreateQuestionDTO,
  ): Promise<QuestionViewModel> {
    const question: QuestionEntity = {
      id: randomUUID(),
      body: createQuestionDTO.body,
      correctAnswers: createQuestionDTO.correctAnswers,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: 'no update',
    };
    await this.questionsRepository.createQuestion(question);
    const questionViewModel = mapQuestions.mapQuestionViewModel(question);
    return questionViewModel;
  }
  async getQuestions(questionPaginationDTO: QuestionsPaginationDTO) {
    const pagination = helper.getQuestionPaginationDTO(questionPaginationDTO);
    console.log(pagination);
    return this.questionsRepository.getQuestions(pagination);
  }

  async deleteQuestions(questionId: string): Promise<boolean> {
    return this.questionsRepository.deleteQuestion(questionId);
  }
}
