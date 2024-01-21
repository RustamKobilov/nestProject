import { PostService } from './postService';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateCommentDto, PaginationDTO, UpdateLikeStatusDto } from '../DTO';
import { Response } from 'express';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { SkipThrottle } from '@nestjs/throttler';
import { IdenteficationUserGuard } from '../auth/Guard/identeficationUserGuard';
import { CommandBus } from '@nestjs/cqrs';
import { GetPostsUseCaseCommand } from './use-cases/get-posts-use-case';
import { UpdateLikeStatusPostUseCaseCommand } from './use-cases/update-like-status-post-use-case';
import { CreateCommentForPostUseCaseCommand } from './use-cases/create-comment-for-post-use-case';
import { GetCommentViewModelUseCaseCommand } from '../Comment/use-cases/get-comment-view-model-use-case';
import { GetCommentsForPostUseCaseCommand } from './use-cases/get-comments-for-post-use-case';
import { GetPostsForUserUseCaseCommand } from './use-cases/get-posts-for-user-use-case';
import { GetCommentsForPostForUserUseCaseCommand } from './use-cases/get-comments-for-post-for-user-use-case';
import { GetPostForUserUseCaseCommand } from './use-cases/get-post-for-user-use-case';

@SkipThrottle()
@Controller('posts')
export class PostController {
  constructor(
    private commandBus: CommandBus,
    private readonly postService: PostService,
  ) {}

  @Get()
  @UseGuards(IdenteficationUserGuard)
  async getPosts(
    @Query() postPagination: PaginationDTO,
    @Res() res,
    @Req() req,
  ) {
    let resultAllPosts;
    if (!req.user) {
      resultAllPosts = await this.commandBus.execute(
        new GetPostsUseCaseCommand(postPagination),
      );
      console.log('async getPosts/post Controller');
      console.log(resultAllPosts);
      return res.status(200).send(resultAllPosts);
    }
    resultAllPosts = await this.commandBus.execute(
      new GetPostsForUserUseCaseCommand(postPagination, req.user.id),
    );
    return res.status(200).send(resultAllPosts);
  }
  @Get('/:id')
  @UseGuards(IdenteficationUserGuard)
  async getPost(@Param('id') postId: string, @Res() res, @Req() req) {
    let post;
    if (!req.user) {
      post = await this.postService.getPost(postId);
      return res.status(200).send(post);
    }
    post = await this.commandBus.execute(
      new GetPostForUserUseCaseCommand(postId, req.user.id),
    );
    return res.status(200).send(post);
  }

  @UseGuards(BearerGuard)
  @Post('/:postId/comments')
  async createCommentForPost(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
    @Res() res: Response,
    @Req() req,
  ) {
    await this.postService.getPost(postId);
    const addCommentByPostReturnIdComment = await this.commandBus.execute(
      new CreateCommentForPostUseCaseCommand(
        postId,
        createCommentDto.content,
        req.user,
      ),
    ); //return id new comment
    const newCommentByPost = await this.commandBus.execute(
      new GetCommentViewModelUseCaseCommand(addCommentByPostReturnIdComment),
    );
    return res.status(201).send(newCommentByPost);
  }

  @UseGuards(IdenteficationUserGuard)
  @Get('/:postId/comments')
  async getCommentsForPost(
    @Query() getPagination: PaginationDTO,
    @Param('postId') postId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    await this.postService.getPost(postId);
    let resultAllCommentsByPosts;
    if (!req.user) {
      resultAllCommentsByPosts = await this.commandBus.execute(
        new GetCommentsForPostUseCaseCommand(getPagination, postId),
      );
      return res.status(200).send(resultAllCommentsByPosts);
    }
    resultAllCommentsByPosts = await this.commandBus.execute(
      new GetCommentsForPostForUserUseCaseCommand(
        getPagination,
        postId,
        req.user.id,
      ),
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
    await this.commandBus.execute(
      new UpdateLikeStatusPostUseCaseCommand(
        postId,
        updateLikeStatus.likeStatus,
        req.user,
      ),
    );
    return res.sendStatus(204);
  }
}
