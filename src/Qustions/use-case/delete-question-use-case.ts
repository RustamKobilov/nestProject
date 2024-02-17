import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../questionsRepository';
import { isUUID } from 'class-validator';
import { NotFoundException } from '@nestjs/common';

export class DeleteQuestionUseCaseCommand {
  constructor(public questionId: string) {}
}
@CommandHandler(DeleteQuestionUseCaseCommand)
export class DeleteQuestionUseCase {
  constructor(public questionsRepository: QuestionsRepository) {}
  async execute(command: DeleteQuestionUseCaseCommand): Promise<boolean> {
    if (isUUID(command.questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/deleteQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(
      command.questionId,
    );
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/deleteQuestion',
      );
    }
    return this.questionsRepository.deleteQuestion(command.questionId);
  }
}
