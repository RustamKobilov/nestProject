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
  Res,
} from '@nestjs/common';
import {
  BlogPaginationDTO,
  CreateBlogDTO,
  CreatePostByBlogDTO,
  PaginationDTO,
} from '../DTO';
import { BlogService } from './blogService';
import { Response } from 'express';

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
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDTO) {
    return this.blogService.createNewBlog(createBlogDto);
  }
  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: CreateBlogDTO,
    @Res() res: Response,
  ) {
    await this.blogService.updateBlog(blogId, updateBlogDto);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string, @Res() res: Response) {
    await this.blogService.deleteBlog(blogId);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @Get('/:id/posts')
  async getPostsByBlog(
    @Param('id') blogId: string,
    @Query() postPagination: PaginationDTO,
  ) {
    return this.blogService.getPostsbyBlog(blogId, postPagination);
  }
  @Post('/:id/posts')
  async createPostByBlog(
    @Body() createPostDto: CreatePostByBlogDTO,
    @Param('id') blogId: string,
  ) {
    return this.blogService.createPostByBlog(createPostDto, blogId);
  }
}
