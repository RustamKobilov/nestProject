import { QuestionsRepository } from './questionsRepository';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CreateQuestionDTO,
  QuestionsPaginationDTO,
  SaQuestionViewModel,
} from './questionDTO';
import { QuestionEntity } from './Entitys/QuestionEntity';
import { randomUUID } from 'crypto';
import { mapKuiz } from './mapKuiz';
import { helper } from '../helper';
import { isUUID } from 'class-validator';

@Injectable()
export class QuestionsService {
  constructor(private readonly questionsRepository: QuestionsRepository) {}

  async createQuestion(
    createQuestionDTO: CreateQuestionDTO,
  ): Promise<SaQuestionViewModel> {
    const question: QuestionEntity = {
      id: randomUUID(),
      body: createQuestionDTO.body,
      correctAnswers: createQuestionDTO.correctAnswers,
      published: false,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    await this.questionsRepository.createQuestion(question);
    const questionViewModel = mapKuiz.mapSaQuestionsViewModel([question])[0];
    return questionViewModel;
  }

  async getQuestions(questionPaginationDTO: QuestionsPaginationDTO) {
    const pagination = helper.getQuestionPaginationDTO(questionPaginationDTO);
    console.log(pagination);
    return this.questionsRepository.getQuestions(pagination);
  }

  async deleteQuestions(questionId: string): Promise<boolean> {
    if (isUUID(questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/deleteQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(questionId);
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/deleteQuestion',
      );
    }
    return this.questionsRepository.deleteQuestion(questionId);
  }

  async updateQuestion(
    questionId: string,
    updateQuestionDTO: CreateQuestionDTO,
  ) {
    if (isUUID(questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(questionId);
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const updateQuestion = this.questionsRepository.updateQuestion(
      questionId,
      updateQuestionDTO,
    );
    if (!updateQuestion) {
      throw new NotFoundException(
        'question ne obnovilsya, questionService ,update',
      );
    }
    return true;
  }

  async updatePublishQuestion(questionId: string, published: boolean) {
    if (isUUID(questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(questionId);
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const updateQuestion = this.questionsRepository.updatePublishQuestion(
      questionId,
      published,
    );
    if (!updateQuestion) {
      throw new NotFoundException(
        'question ne obnovilsya, questionService ,update',
      );
    }
    return true;
  }
}
