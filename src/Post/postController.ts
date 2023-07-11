import { PostService } from './postService';
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
import { CreateCommentByPostDTO, CreatePostDTO, PaginationDTO } from '../DTO';
import { Response } from 'express';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Post()
  async createPost(@Body() createPostDto: CreatePostDTO) {
    return this.postService.createNewPost(createPostDto);
  }
  @Get()
  async getPosts(@Query() postPagination: PaginationDTO) {
    return this.postService.getPosts(postPagination);
  }
  @Get('/:id')
  async getPost(@Param('id') postId: string) {
    return this.postService.getPost(postId);
  }
  @Put('/:id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: CreatePostDTO,
    @Res() res: Response,
  ) {
    await this.postService.updatePost(postId, updatePostDto);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @Delete('/:id')
  async deletePost(@Param('id') postId: string, @Res() res: Response) {
    await this.postService.deletePost(postId);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @Post()
  async createCommentByPost(
    @Body() createCommentDto: CreateCommentByPostDTO,
    @Param('id') postId: string,
  ) {
    return this.postService.createNewComment(createCommentDto, postId);
  }
}
