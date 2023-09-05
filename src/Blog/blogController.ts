import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  BlogPaginationDTO,
  CreateBlogDTO,
  CreatePostByBlogDTO,
  PaginationDTO,
} from '../DTO';
import { BlogService } from './blogService';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthorizationGuard } from '../auth/Guard/basicAuthorizationGuard';
import { IdenteficationUserGuard } from '../auth/Guard/identeficationUserGuard';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogsUseCaseCommand } from './use-cases/get-blogs-use-case';
import { CreateBlogUseCaseCommand } from './use-cases/create-blog-use-case';
import { UpdateUseCaseCommand } from './use-cases/update-blog-use-case';
import { DeleteBlogUseCaseCommand } from './use-cases/delete-blog-use-case';
import { GetPostByBlogCommand } from './use-cases/get-post-by-blog';
import { CreatePostByBlogCommand } from './use-cases/create-post-by-blog';
import { GetPostByBlogForUserCommand } from './use-cases/get-post-by-blog-for-user';

@SkipThrottle()
@Controller('blogs')
export class BlogController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogService: BlogService,
  ) {}
  @Get()
  async getBlogs(@Query() blogPagination: BlogPaginationDTO) {
    return this.commandBus.execute(new GetBlogsUseCaseCommand(blogPagination));
  }
  @Get('/:id')
  async getBlog(@Param('id') blogId: string) {
    return this.blogService.getBlog(blogId);
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
  @UseGuards(IdenteficationUserGuard)
  @Get('/:id/posts')
  async getPostsByBlog(
    @Query() getPagination: PaginationDTO,
    @Param('id') blogId: string,
    @Query() postPagination: PaginationDTO,
    @Res() res: Response,
    @Req() req,
  ) {
    console.log(req.user);
    const blog = await this.blogService.getBlog(blogId);
    let resultAllPostsByBlog;
    if (!req.user) {
      resultAllPostsByBlog = await this.commandBus.execute(
        new GetPostByBlogCommand(blogId, getPagination),
      );
      return res.status(200).send(resultAllPostsByBlog);
    }
    resultAllPostsByBlog = await this.commandBus.execute(
      new GetPostByBlogForUserCommand(blogId, getPagination, req.user.id),
    );
    return res.status(200).send(resultAllPostsByBlog);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Post('/:id/posts')
  async createPostByBlog(
    @Body() createPostDto: CreatePostByBlogDTO,
    @Param('id') blogId: string,
  ) {
    return await this.commandBus.execute(
      new CreatePostByBlogCommand(createPostDto, blogId),
    );
  }
}
