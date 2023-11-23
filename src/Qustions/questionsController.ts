import { QuestionsService } from './questionsService';
import { Body, Controller, Injectable, Post, UseGuards } from '@nestjs/common';
import { CreateUserDto } from '../DTO';
import { CreateUserAdminUseCaseCommand } from '../User/use-cases/create-user-admin-use-case';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { CreateQuestionDTO } from './questionDTO';
@Injectable()
@Controller('sa/quiz')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}
  //   @UseGuards(BearerGuard)
  // @Post()
  // createQuestion(@Body() createQuestionDTO: CreateQuestionDTO) {
  //   return this.questionsService.createQuestion(createQuestionDTO,req.user)
}
