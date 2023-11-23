import { QuestionEntity } from './Entitys/QuestionEntity';
import { QuestionViewModel } from './questionDTO';

export const mapQuestions = {
  mapQuestionViewModel(question: QuestionEntity): QuestionViewModel {
    return {
      id: question.id,
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  },
};
