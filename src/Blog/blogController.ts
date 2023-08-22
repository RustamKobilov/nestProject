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

@SkipThrottle()
@Controller('blogs')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}
  @Get()
  async getBlogs(@Query() blogPagination: BlogPaginationDTO) {
    return this.blogService.getBlogs(blogPagination);
  }
  @Get('/:id')
  async getBlog(@Param('id') blogId: string) {
    return this.blogService.getBlog(blogId);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDTO) {
    return this.blogService.createNewBlog(createBlogDto);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: CreateBlogDTO,
    @Res() res: Response,
  ) {
    await this.blogService.updateBlog(blogId, updateBlogDto);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string, @Res() res: Response) {
    await this.blogService.deleteBlog(blogId);
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
    const blog = await this.blogService.getBlog(blogId);
    let resultAllPostsByBlog;
    if (!req.user) {
      resultAllPostsByBlog = await this.blogService.getPostsbyBlog(
        blogId,
        getPagination,
      );
      return res.status(200).send(resultAllPostsByBlog);
    }
    resultAllPostsByBlog = await this.blogService.getPostForBlogUser(
      blogId,
      getPagination,
      req.user.id,
    );
    return res.status(200).send(resultAllPostsByBlog);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Post('/:id/posts')
  async createPostByBlog(
    @Body() createPostDto: CreatePostByBlogDTO,
    @Param('id') blogId: string,
  ) {
    return this.blogService.createPostByBlog(createPostDto, blogId);
  }
}
