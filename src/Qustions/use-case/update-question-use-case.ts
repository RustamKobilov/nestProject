import { CreateQuestionDTO } from '../questionDTO';
import { CommandHandler } from '@nestjs/cqrs';
import { isUUID } from 'class-validator';
import { NotFoundException } from '@nestjs/common';
import { QuestionsRepository } from '../questionsRepository';

export class UpdateQuestionUseCaseCommand {
  constructor(
    public questionId: string,
    public updateQuestionDTO: CreateQuestionDTO,
  ) {}
}
@CommandHandler(UpdateQuestionUseCaseCommand)
export class UpdateQuestionUseCase {
  constructor(public questionsRepository: QuestionsRepository) {}
  async execute(command: UpdateQuestionUseCaseCommand) {
    if (isUUID(command.questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(
      command.questionId,
    );
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/updateQuestion',
      );
    }
    const updateQuestion = this.questionsRepository.updateQuestion(
      command.questionId,
      command.updateQuestionDTO,
    );
    if (!updateQuestion) {
      throw new NotFoundException(
        'question ne obnovilsya, questionService ,update',
      );
    }
    return true;
  }
}
