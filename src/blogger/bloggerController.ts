import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { BlogService } from '../Blog/blogService';
import { BlogPaginationDTO, CreateBlogDTO } from '../DTO';
import { GetBlogsUseCaseCommand } from '../Blog/use-cases/get-blogs-use-case';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { GetBlogsForBloggerUseCaseCommand } from './use-cases/get-blogs-for-blogger-use-case';
import { CreateBlogUseCaseCommand } from '../Blog/use-cases/create-blog-use-case';

@SkipThrottle()
@Controller('blogs')
export class BlogController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BearerGuard)
  @Post()
  async createBlog(
    @Body() createBlogDto: CreateBlogDTO,
    @Res() res,
    @Req() req,
  ) {
    return this.commandBus.execute(
      new CreateBlogUseCaseCommand(createBlogDto, req.user.id),
    );
  }
  @UseGuards(BearerGuard)
  @Get()
  async getBlogs(
    @Query() blogPagination: BlogPaginationDTO,
    @Res() res,
    @Req() req,
  ) {
    return this.commandBus.execute(
      new GetBlogsForBloggerUseCaseCommand(blogPagination, req.user.id),
    );
  }
}
