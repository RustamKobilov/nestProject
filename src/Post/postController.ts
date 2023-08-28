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
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  CreateCommentDto,
  CreatePostDTO,
  PaginationDTO,
  UpdateLikeStatusDto,
} from '../DTO';
import { Response } from 'express';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { CommentService } from '../Comment/commentService';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthorizationGuard } from '../auth/Guard/basicAuthorizationGuard';
import { IdenteficationUserGuard } from '../auth/Guard/identeficationUserGuard';
@SkipThrottle()
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly commentService: CommentService,
  ) {}
  @UseGuards(BasicAuthorizationGuard)
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
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id')
  async updatePost(
    @Param('id') postId: string,
    @Body() updatePostDto: CreatePostDTO,
    @Res() res: Response,
  ) {
    await this.postService.updatePost(postId, updatePostDto);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BasicAuthorizationGuard)
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
  @UseGuards(IdenteficationUserGuard)
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
  @UseGuards(BearerGuard)
  @Put('/:id/like-status')
  async updateLikeStatus(
    @Req() req,
    @Res() res,
    @Param('id') postId: string,
    @Body() updateLikeStatus: UpdateLikeStatusDto,
  ) {
    await this.postService.updateLikeStatusPost(
      postId,
      updateLikeStatus.likeStatus,
      req.user,
    );

    return res.sendStatus(204);
  }
}
