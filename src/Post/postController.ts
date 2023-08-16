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
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto, CreatePostDTO, PaginationDTO } from '../DTO';
import { Response } from 'express';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { CommentService } from '../Comment/commentService';
import { SkipThrottle } from '@nestjs/throttler';
@SkipThrottle()
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}
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
  @UseGuards(BearerGuard)
  @Put('/:id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: CreatePostDTO,
    @Res() res: Response,
  ) {
    await this.postService.updatePost(postId, updatePostDto);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BearerGuard)
  @Delete('/:id')
  async deletePost(@Param('id') postId: string, @Res() res: Response) {
    await this.postService.deletePost(postId);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BearerGuard)
  @Post('/:postId/comments')
  async createCommentForPost(
    @Param('id') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Res() res: Response,
    @Req() req,
  ) {
    const post = await this.postService.getPost(postId);
    const addCommentByPost = await this.commentService.createCommentForPost(
      postId,
      createCommentDto.content,
      req.user,
    ); //return id new comment
    const newCommentByPost = await this.commentService.getCommentViewModel(
      addCommentByPost,
    );
    return res.status(201).send(newCommentByPost);
  }
  @UseGuards(BearerGuard)
  @Get('/:postId/comments')
  async getCommentsForPost(
    @Query() getPagination: PaginationDTO,
    @Param('id') postId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const post = await this.postService.getPost(postId);
    let resultAllCommentsByPosts;
    if (!req.user) {
      resultAllCommentsByPosts = await this.commentService.getCommentsForPost(
        getPagination,
        postId,
      );
      return res.status(200).send(resultAllCommentsByPosts);
    }
    resultAllCommentsByPosts = await this.commentService.getCommentsForPostUser(
      getPagination,
      postId,
      req.user.id,
    );
    return res.status(200).send(resultAllCommentsByPosts);
  }
}
