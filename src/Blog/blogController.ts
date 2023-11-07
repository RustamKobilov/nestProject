import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BlogPaginationDTO, PaginationDTO } from '../DTO';
import { BlogService } from './blogService';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { IdenteficationUserGuard } from '../auth/Guard/identeficationUserGuard';
import { CommandBus } from '@nestjs/cqrs';
import { GetBlogsUseCaseCommand } from './use-cases/get-blogs-use-case';
import { GetPostByBlogCommand } from './use-cases/get-post-by-blog';
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
  @UseGuards(IdenteficationUserGuard)
  @Get('/:id/posts')
  async getPostsByBlog(
    @Query() getPagination: PaginationDTO,
    @Param('id') blogId: string,
    @Query() postPagination: PaginationDTO,
    @Res() res: Response,
    @Req() req,
  ) {
    //   console.log(req.user);
    //   const blog = await this.blogService.getBlog(blogId);
    //   const resultAllPostsByBlog = await this.commandBus.execute(
    //     new GetPostByBlogCommand(blogId, getPagination),
    //   );
    //   return res.status(200).send(resultAllPostsByBlog);
    // }

    const blog = await this.blogService.getBlog(blogId);
    let resultAllPostsByBlog;
    if (!req.user) {
      console.log('user no init');
      resultAllPostsByBlog = await this.commandBus.execute(
        new GetPostByBlogCommand(blogId, getPagination),
      );
      // for (const post of resultAllPostsByBlog.items) {
      //   //   console.log(post);
      //   //   post.extendedLikesInfo.likesCount = 0;
      //   //   post.extendedLikesInfo.dislikesCount = 0;
      //   post.extendedLikesInfo.myStatus = 'None';
      //   post.extendedLikesInfo.newestLikes = [];
      // }
      return res.status(200).send(resultAllPostsByBlog);
    }
    console.log('user init');
    console.log(req.user);
    resultAllPostsByBlog = await this.commandBus.execute(
      new GetPostByBlogForUserCommand(blogId, getPagination, req.user.id),
    );
    return res.status(200).send(resultAllPostsByBlog);
  }
}
