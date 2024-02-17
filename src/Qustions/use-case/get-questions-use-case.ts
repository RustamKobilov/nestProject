import { QuestionsPaginationDTO, SaQuestionViewModel } from '../questionDTO';
import { CommandHandler } from '@nestjs/cqrs';
import { QuestionsRepository } from '../questionsRepository';
import { helper } from '../../helper';
import { outputModel } from '../../DTO';

export class GetQuestionsUseCaseCommand {
  constructor(public questionPaginationDTO: QuestionsPaginationDTO) {}
}
@CommandHandler(GetQuestionsUseCaseCommand)
export class GetQuestionsUseCase {
  constructor(public questionsRepository: QuestionsRepository) {}
  async execute(
    command: GetQuestionsUseCaseCommand,
  ): Promise<outputModel<SaQuestionViewModel>> {
    const pagination = helper.getQuestionPaginationDTO(
      command.questionPaginationDTO,
    );
    //console.log(pagination);
    return this.questionsRepository.getQuestions(pagination);
  }
}
