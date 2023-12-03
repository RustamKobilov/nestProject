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
  CreateBlogDTO,
  CreatePostByBlogDTO,
  CreatePostDTO,
  CreateUserDto,
  PaginationDTO,
  UserPaginationDTO,
} from '../DTO';
import { GetUsersUseCaseCommand } from '../User/use-cases/get-users-use-case';
import { CreateUserAdminUseCaseCommand } from '../User/use-cases/create-user-admin-use-case';
import { Response } from 'express';
import { DeleteUserUseCaseCommand } from '../User/use-cases/delete-user-use-case';
import { GetBlogsUseCaseCommand } from '../Blog/use-cases/get-blogs-use-case';
import { CreateBlogUseCaseCommand } from '../Blog/use-cases/create-blog-use-case';
import { UpdateUseCaseCommand } from '../Blog/use-cases/update-blog-use-case';
import { DeleteBlogUseCaseCommand } from '../Blog/use-cases/delete-blog-use-case';
import { CreatePostByBlogCommand } from '../Blog/use-cases/create-post-by-blog';
import { GetPostByBlogCommand } from '../Blog/use-cases/get-post-by-blog';
import { UpdatePostUserCaseCommand } from '../Post/use-cases/update-post-use-case';
import { DeletePostUseCaseCommand } from '../Post/use-cases/delete-post-use-case';
import { BlogService } from '../Blog/blogService';
import { QuestionsService } from '../Qustions/questionsService';
import {
  CreateQuestionDTO,
  QuestionsPaginationDTO,
  UpdatePublishedQuestionDTO,
} from '../Qustions/questionDTO';

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
}

@SkipThrottle()
@Controller('/sa/blogs')
export class adminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogService: BlogService,
  ) {}
  @UseGuards(BasicAuthorizationGuard)
  @Get()
  async getBlogs(@Query() blogPagination: BlogPaginationDTO) {
    return this.commandBus.execute(new GetBlogsUseCaseCommand(blogPagination));
  }

  @UseGuards(BasicAuthorizationGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDTO) {
    return this.commandBus.execute(new CreateBlogUseCaseCommand(createBlogDto));
  }

  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: CreateBlogDTO,
    @Res() res: Response,
  ) {
    await this.commandBus.execute(
      new UpdateUseCaseCommand(blogId, updateBlogDto),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string, @Res() res: Response) {
    await this.commandBus.execute(new DeleteBlogUseCaseCommand(blogId));
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthorizationGuard)
  @Get('/:id/posts')
  async getPostsByBlog(
    @Query() getPagination: PaginationDTO,
    @Param('id') blogId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const blog = await this.blogService.getBlog(blogId);
    const resultAllPostsByBlog = await this.commandBus.execute(
      new GetPostByBlogCommand(blogId, getPagination),
    );
    for (const post of resultAllPostsByBlog.items) {
      //   console.log(post);
      //   post.extendedLikesInfo.likesCount = 0;
      //   post.extendedLikesInfo.dislikesCount = 0;
      post.extendedLikesInfo.myStatus = 'None';
      post.extendedLikesInfo.newestLikes = [];
    }

    return res.status(200).send(resultAllPostsByBlog);
  }

  @UseGuards(BasicAuthorizationGuard)
  @Post('/:id/posts')
  async createPostByBlog(
    @Body() createPostDto: CreatePostByBlogDTO,
    @Param('id') blogId: string,
  ) {
    console.log('createPostDto');
    console.log(createPostDto);
    return await this.commandBus.execute(
      new CreatePostByBlogCommand(createPostDto, blogId),
    );
  }
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id/posts/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Body() updatePostDto: CreatePostDTO,
    @Res() res: Response,
  ) {
    console.log("vhod /:id/posts/:postId'");
    await this.commandBus.execute(
      new UpdatePostUserCaseCommand(postId, updatePostDto, blogId),
    );

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id/posts/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Res() res: Response,
  ) {
    console.log(postId + ' postId');
    await this.commandBus.execute(new DeletePostUseCaseCommand(postId, blogId));
    return res.sendStatus(HttpStatus.NO_CONTENT);
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
    @Query() questionPaginationDTO: QuestionsPaginationDTO,
    @Res() res: Response,
  ) {
    res
      .status(200)
      .send(await this.questionsService.getQuestions(questionPaginationDTO));
  }
  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteQuestion(@Param('id') questionId: string, @Res() res: Response) {
    await this.questionsService.deleteQuestions(questionId);
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
