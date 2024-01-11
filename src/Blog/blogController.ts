import { Controller, Get, Param, Query, Req, Res } from '@nestjs/common';
import { BlogPaginationDTO, PaginationDTO } from '../DTO';
import { BlogService } from './blogService';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogsUseCaseCommand } from './use-cases/get-blogs-use-case';
import { GetPostByBlogCommand } from './use-cases/get-post-by-blog-use-case';
import { GetBlogUseCaseCommand } from './use-cases/get-blog-use-case';

@SkipThrottle()
@Controller('blogs')
export class BlogController {
  constructor(private commandBus: CommandBus) {}

  @Get()
  async getBlogs(
    @Query() blogPagination: BlogPaginationDTO,
    @Res() res,
    @Req() req,
  ) {
    const blogs = await this.commandBus.execute(
      new GetBlogsUseCaseCommand(blogPagination),
    );
    res.status(200).send(blogs);
  }
  @Get('/:id/posts')
  async getPostsByBlog(
    @Query() getPagination: PaginationDTO,
    @Param('id') blogId: string,
    @Query() postPagination: PaginationDTO,
    @Res() res: Response,
    @Req() req,
  ) {
    const blog = await this.commandBus.execute(
      new GetBlogUseCaseCommand(blogId),
    );
    const resultAllPostsByBlog = await this.commandBus.execute(
      new GetPostByBlogCommand(blogId, getPagination),
    );
    return res.status(200).send(resultAllPostsByBlog);
  }
  @Get('/:id')
  async getBlog(@Param('id') blogId: string, @Res() res: Response, @Req() req) {
    const blog = await this.commandBus.execute(
      new GetBlogUseCaseCommand(blogId),
    );
    return res.status(200).send(blog);
  }
}
