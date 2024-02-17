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
  PaginationSqlDTO,
  UpdateBanStatusBlogForSaDTO,
  UpdateBanStatusUserDTO,
  UserAdminPaginationDTO,
} from '../DTO';
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
import { ReactionRepository } from '../Reaction/reactionRepository';
import { UserBanListRepositoryTypeORM } from '../UserBanList/userBanListRepositoryTypeORM';
import { UserRepository } from '../User/userRepository';
import { GetUsersAdminUseCaseCommand } from '../User/use-cases/get-users-admin-use-case';
import { UpdateBanStatusBlogUseCaseCommand } from '../Blog/use-cases/update-ban-status-blog-use-case';
import { DeleteQuestionUseCaseCommand } from '../Qustions/use-case/delete-question-use-case';
import { UpdateQuestionUseCaseCommand } from '../Qustions/use-case/update-question-use-case';
import { UpdatePublishQuestionUseCaseCommand } from '../Qustions/use-case/update-publish-question-use-case';
import { GetQuestionsUseCaseCommand } from '../Qustions/use-case/get-questions-use-case';

@SkipThrottle()
@Controller('/sa/users')
export class adminUserController {
  constructor(
    private commandBus: CommandBus,
    private reactionRepository: ReactionRepository,
    private userRepository: UserRepository,
    private userBan: UserBanListRepositoryTypeORM,
  ) {}
  // @UseGuards(BasicAuthorizationGuard)
  // @Get('/check')
  // async getChecks(@Query() userPagination: UserPaginationDTO) {
  //   //await this.reactionRepository.getAllParentInAddReactionBanUser(req.user.id);
  //   return this.commandBus.execute(
  //     new GetUsersAdminUseCaseCommand(userPagination),
  //   );
  // }

  @UseGuards(BasicAuthorizationGuard)
  @Get()
  getUsers(@Query() userPagination: UserAdminPaginationDTO) {
    return this.commandBus.execute(
      new GetUsersAdminUseCaseCommand(userPagination),
    );
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
    @Query() userAdminPaginationDTO: PaginationSqlDTO,
    @Body() updateBanStatusUserDTO: UpdateBanStatusUserDTO,
    @Res() res: Response,
    @Req() req,
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
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id/ban')
  async banBlog(
    @Param('id') blogId: string,
    @Body() updateBanStatusUserForBlogDTO: UpdateBanStatusBlogForSaDTO,
    @Res() res: Response,
  ) {
    await this.commandBus.execute(
      new UpdateBanStatusBlogUseCaseCommand(
        blogId,
        updateBanStatusUserForBlogDTO.isBanned,
      ),
    );

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}

@Injectable()
@Controller('sa/quiz/questions')
export class adminQuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private commandBus: CommandBus,
  ) {}

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
    const questions = await this.commandBus.execute(
      new GetQuestionsUseCaseCommand(paginationDTO),
    );
    res.status(200).send(questions);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteQuestion(@Param('id') questionId: string, @Res() res: Response) {
    await this.commandBus.execute(new DeleteQuestionUseCaseCommand(questionId));
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id')
  async updateQuestion(
    @Param('id') questionId: string,
    @Body() updateQuestionDTO: CreateQuestionDTO,
    @Res() res: Response,
  ) {
    await this.commandBus.execute(
      new UpdateQuestionUseCaseCommand(questionId, updateQuestionDTO),
    );
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
    await this.commandBus.execute(
      new UpdatePublishQuestionUseCaseCommand(
        questionId,
        updatePublishedQuestion.published,
      ),
    );
    res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
