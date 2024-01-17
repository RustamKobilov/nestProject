import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Injectable,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthorizationGuard } from '../auth/Guard/basicAuthorizationGuard';
import {
  BlogPaginationDTO,
  CreateUserDto,
  PaginationUpdateBanStatusUserDTO,
  UserPaginationDTO,
} from '../DTO';
import { GetUsersUseCaseCommand } from '../User/use-cases/get-users-use-case';
import { CreateUserAdminUseCaseCommand } from '../User/use-cases/create-user-admin-use-case';
import { Response } from 'express';
import { DeleteUserUseCaseCommand } from '../User/use-cases/delete-user-use-case';
import { QuestionsService } from '../Qustions/questionsService';
import {
  CreateQuestionDTO,
  QuestionsPaginationDTO,
  UpdatePublishedQuestionDTO,
} from '../Qustions/questionDTO';
import { GetBlogsForSaUseCaseCommand } from '../Blog/use-cases/get-blogs-for-sa-use-case';
import { UpdateBanStatusForUserCommand } from '../User/use-cases/update-ban-status-user-use-case';

@SkipThrottle()
@Controller('/sa/users')
export class adminUserController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BasicAuthorizationGuard)
  @Get()
  getUsers(@Query() userPagination: UserPaginationDTO) {
    return this.commandBus.execute(new GetUsersUseCaseCommand(userPagination));
  }

  @UseGuards(BasicAuthorizationGuard)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserAdminUseCaseCommand(createUserDto),
    );
  }

  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteUser(@Param('id') userId: string, @Res() res: Response) {
    await this.commandBus.execute(new DeleteUserUseCaseCommand(userId));
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id/ban')
  async updateBanStatusUser(
    @Param('id') userId: string,
    @Query() updateBanStatusUserDTO: PaginationUpdateBanStatusUserDTO,
    @Res() res: Response,
  ) {
    console.log(updateBanStatusUserDTO);
    await this.commandBus.execute(
      new UpdateBanStatusForUserCommand(
        userId,
        updateBanStatusUserDTO.isBanned,
        updateBanStatusUserDTO.banReason,
      ),
    );
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}

@SkipThrottle()
@Controller('/sa/blogs')
export class adminBlogsController {
  constructor(private commandBus: CommandBus) {}
  @UseGuards(BasicAuthorizationGuard)
  @Get()
  async getBlogs(
    @Query() blogPagination: BlogPaginationDTO,
    @Res() res,
    @Req() req,
  ) {
    const blogs = await this.commandBus.execute(
      new GetBlogsForSaUseCaseCommand(blogPagination),
    );
    res.status(200).send(blogs);
  }

  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id/bind-with-user/:userId')
  async bindBlog(
    @Param('userId') userId: string,
    @Param('id') blogId: string,
    @Res() res: Response,
  ) {
    console.log('updateZapikan');
    // await this.commandBus.execute(
    //   new UpdatePostUserCaseCommand(postId, updatePostDto, blogId),
    // );

    return res.sendStatus(HttpStatus.BAD_REQUEST);
  }
}

@Injectable()
@Controller('sa/quiz/questions')
export class adminQuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @UseGuards(BasicAuthorizationGuard)
  @Post()
  async createQuestion(@Body() createQuestionDTO: CreateQuestionDTO) {
    return this.questionsService.createQuestion(createQuestionDTO);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Get()
  async getQuestions(
    @Query() paginationDTO: QuestionsPaginationDTO,
    @Res() res: Response,
  ) {
    res
      .status(200)
      .send(await this.questionsService.getQuestions(paginationDTO));
  }
  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteQuestion(@Param('id') questionId: string, @Res() res: Response) {
    await this.questionsService.deleteQuestion(questionId);
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id')
  async updateQuestion(
    @Param('id') questionId: string,
    @Body() updateQuestionDTO: CreateQuestionDTO,
    @Res() res: Response,
  ) {
    await this.questionsService.updateQuestion(questionId, updateQuestionDTO);
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id/publish')
  async updatePublishQuestion(
    @Param('id') questionId: string,
    @Body() updatePublishedQuestion: UpdatePublishedQuestionDTO,
    @Res() res: Response,
  ) {
    console.log(updatePublishedQuestion.published);
    await this.questionsService.updatePublishQuestion(
      questionId,
      updatePublishedQuestion.published,
    );
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
