import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../questionsRepository';
import { isUUID } from 'class-validator';
import { NotFoundException } from '@nestjs/common';

export class UpdatePublishQuestionUseCaseCommand {
  constructor(public questionId: string, public published: boolean) {}
}
@CommandHandler(UpdatePublishQuestionUseCaseCommand)
export class UpdatePublishQuestionUseCase {
  constructor(public questionsRepository: QuestionsRepository) {}

  async execute(command: UpdatePublishQuestionUseCaseCommand) {
    if (isUUID(command.questionId) === false) {
      throw new NotFoundException(
        'questionId not found question /questionService/updatePublishQuestion',
      );
    }
    const question = await this.questionsRepository.getQuestionId(
      command.questionId,
    );
    if (question.length < 1) {
      throw new NotFoundException(
        'questionId not found question /questionService/updatePublishQuestion',
      );
    }
    const updateQuestion = this.questionsRepository.updatePublishQuestion(
      command.questionId,
      command.published,
    );
    if (!updateQuestion) {
      throw new NotFoundException(
        'question ne obnovilsya, questionService ,update',
      );
    }
    return true;
  }
}
