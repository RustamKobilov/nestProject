import { SkipThrottle } from '@nestjs/throttler';
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
import { CommandBus } from '@nestjs/cqrs';
import {
  BlogPaginationDTO,
  CreateBlogDTO,
  CreatePostByBlogDTO,
  CreatePostDTO,
  PaginationDTO,
} from '../DTO';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { GetBlogsForBloggerUseCaseCommand } from './use-cases/get-blogs-for-blogger-use-case';
import { CreateBlogUseCaseCommand } from '../Blog/use-cases/create-blog-use-case';
import { Response } from 'express';
import { UpdateUseCaseCommand } from '../Blog/use-cases/update-blog-use-case';
import { DeleteBlogUseCaseCommand } from '../Blog/use-cases/delete-blog-use-case';
import { CreatePostByBlogCommand } from '../Blog/use-cases/create-post-by-blog-use-case';
import { UpdatePostUserCaseCommand } from '../Post/use-cases/update-post-use-case';
import { DeletePostUseCaseCommand } from '../Post/use-cases/delete-post-use-case';
import { GetPostByBlogForBloggerCommand } from '../Blog/use-cases/get-post-by-blog-for-blogger-use-case';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BearerGuard)
  @Post()
  async createBlog(
    @Body() createBlogDto: CreateBlogDTO,
    @Res() res,
    @Req() req,
  ) {
    const blog = await this.commandBus.execute(
      new CreateBlogUseCaseCommand(createBlogDto, req.user.id, req.user.login),
    );
    res.status(201).send(blog);
  }

  @UseGuards(BearerGuard)
  @Get()
  async getBlogs(
    @Query() blogPagination: BlogPaginationDTO,
    @Res() res,
    @Req() req,
  ) {
    const blogs = await this.commandBus.execute(
      new GetBlogsForBloggerUseCaseCommand(blogPagination, req.user.id),
    );
    res.status(200).send(blogs);
  }
  @UseGuards(BearerGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: CreateBlogDTO,
    @Res() res,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdateUseCaseCommand(blogId, updateBlogDto, req.user.id),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BearerGuard)
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string, @Res() res, @Req() req) {
    await this.commandBus.execute(
      new DeleteBlogUseCaseCommand(blogId, req.user.id),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BearerGuard)
  @Post('/:id/posts')
  async createPostByBlog(
    @Body() createPostDto: CreatePostByBlogDTO,
    @Param('id') blogId: string,
    @Res() res,
    @Req() req,
  ) {
    const posts = await this.commandBus.execute(
      new CreatePostByBlogCommand(createPostDto, blogId, req.user.id),
    );
    return res.status(201).send(posts);
  }
  @UseGuards(BearerGuard)
  @Get('/:id/posts')
  async getPostsByBlog(
    @Query() getPagination: PaginationDTO,
    @Param('id') blogId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const resultAllPostsByBlog = await this.commandBus.execute(
      new GetPostByBlogForBloggerCommand(blogId, getPagination, req.user.id),
    );
    return res.status(200).send(resultAllPostsByBlog);
  }
  @UseGuards(BearerGuard)
  @Put('/:id/posts/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Body() updatePostDto: CreatePostDTO,
    @Res() res: Response,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdatePostUserCaseCommand(postId, updatePostDto, blogId, req.user.id),
    );

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BearerGuard)
  @Delete('/:id/posts/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new DeletePostUseCaseCommand(postId, blogId, req.user.id),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
