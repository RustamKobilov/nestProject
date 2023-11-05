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
import { BasicAuthorizationGuard } from '../auth/Guard/basicAuthorizationGuard';
import {
  BlogPaginationDTO,
  CreateBlogDTO,
  CreateCommentDto,
  CreatePostByBlogDTO,
  CreatePostDTO,
  CreateUserDto,
  PaginationDTO,
  UpdateLikeStatusDto,
  UserPaginationDTO,
} from '../DTO';
import { GetUsersUseCaseCommand } from '../User/use-cases/get-users-use-case';
import { CreateUserAdminUseCaseCommand } from '../User/use-cases/create-user-admin-use-case';
import { Response } from 'express';
import { DeleteUserUseCaseCommand } from '../User/use-cases/delete-user-use-case';
import { GetBlogsUseCaseCommand } from '../Blog/use-cases/get-blogs-use-case';
import { CreateBlogUseCaseCommand } from '../Blog/use-cases/create-blog-use-case';
import { UpdateUseCaseCommand } from '../Blog/use-cases/update-blog-use-case';
import { DeleteBlogUseCaseCommand } from '../Blog/use-cases/delete-blog-use-case';
import { CreatePostByBlogCommand } from '../Blog/use-cases/create-post-by-blog';
import { IdenteficationUserGuard } from '../auth/Guard/identeficationUserGuard';
import { GetPostByBlogCommand } from '../Blog/use-cases/get-post-by-blog';
import { GetPostByBlogForUserCommand } from '../Blog/use-cases/get-post-by-blog-for-user';
import { GetPostsUseCaseCommand } from '../Post/use-cases/get-posts-use-case';
import { GetPostsForUserUseCaseCommand } from '../Post/use-cases/get-posts-for-user-use-case';
import { GetPostForUserUseCaseCommand } from '../Post/use-cases/get-post-for-user-use-case';
import { UpdatePostUserCaseCommand } from '../Post/use-cases/update-post-use-case';
import { DeletePostUseCaseCommand } from '../Post/use-cases/delete-post-use-case';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { CreateCommentForPostUseCaseCommand } from '../Post/use-cases/create-comment-for-post-use-case';
import { GetCommentViewModelUseCaseCommand } from '../Comment/use-cases/get-comment-view-model-use-case';
import { GetCommentsForPostUseCaseCommand } from '../Post/use-cases/get-comments-for-post-use-case';
import { GetCommentsForPostForUserUseCaseCommand } from '../Post/use-cases/get-comments-for-post-for-user-use-case';
import { UpdateLikeStatusPostUseCaseCommand } from '../Post/use-cases/update-like-status-post-use-case';
import { BlogService } from '../Blog/blogService';

@SkipThrottle()
@Controller('/sa/users')
export class adminUserController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BasicAuthorizationGuard)
  @Get()
  getUsers(@Query() userPagination: UserPaginationDTO) {
    return this.commandBus.execute(new GetUsersUseCaseCommand(userPagination));
  }

  @UseGuards(BasicAuthorizationGuard)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserAdminUseCaseCommand(createUserDto),
    );
  }

  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteUser(@Param('id') userId: string, @Res() res: Response) {
    await this.commandBus.execute(new DeleteUserUseCaseCommand(userId));
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}

@SkipThrottle()
@Controller('/sa/blogs')
export class adminBlogsController {
  constructor(
    private commandBus: CommandBus,
    private readonly blogService: BlogService,
  ) {}
  @UseGuards(BasicAuthorizationGuard)
  @Get()
  async getBlogs(@Query() blogPagination: BlogPaginationDTO) {
    return this.commandBus.execute(new GetBlogsUseCaseCommand(blogPagination));
  }

  @UseGuards(BasicAuthorizationGuard)
  @Post()
  async createBlog(@Body() createBlogDto: CreateBlogDTO) {
    return this.commandBus.execute(new CreateBlogUseCaseCommand(createBlogDto));
  }

  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: CreateBlogDTO,
    @Res() res: Response,
  ) {
    await this.commandBus.execute(
      new UpdateUseCaseCommand(blogId, updateBlogDto),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string, @Res() res: Response) {
    await this.commandBus.execute(new DeleteBlogUseCaseCommand(blogId));
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BasicAuthorizationGuard)
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
      console.log('user no init');
      resultAllPostsByBlog = await this.commandBus.execute(
        new GetPostByBlogCommand(blogId, getPagination),
      );
      return res.status(200).send(resultAllPostsByBlog);
    }
    console.log('user init');
    console.log(req.user);
    resultAllPostsByBlog = await this.commandBus.execute(
      new GetPostByBlogForUserCommand(blogId, getPagination, req.user.id),
    );
    return res.status(200).send(resultAllPostsByBlog);
  }

  @UseGuards(BasicAuthorizationGuard)
  @Post('/:id/posts')
  async createPostByBlog(
    @Body() createPostDto: CreatePostByBlogDTO,
    @Param('id') blogId: string,
  ) {
    return await this.commandBus.execute(
      new CreatePostByBlogCommand(createPostDto, blogId),
    );
  }
  @UseGuards(BasicAuthorizationGuard)
  @Put('/:id/posts/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Body() updatePostDto: CreatePostDTO,
    @Res() res: Response,
  ) {
    console.log("vhod /:id/posts/:postId'");
    await this.commandBus.execute(
      new UpdatePostUserCaseCommand(postId, updatePostDto, blogId),
    );

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id/posts/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Res() res: Response,
  ) {
    console.log(postId + ' postId');
    await this.commandBus.execute(new DeletePostUseCaseCommand(postId, blogId));
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
// @SkipThrottle()
// @Controller('/sa/posts')
// export class adminPostsController {
//   @UseGuards(BasicAuthorizationGuard)
//   @Post()
//   async createPost(@Body() createPostDto: CreatePostDTO) {
//     return this.postService.createNewPost(createPostDto);
//   }
//   @Get()
//   @UseGuards(IdenteficationUserGuard)
//   async getPosts(
//     @Query() postPagination: PaginationDTO,
//     @Res() res,
//     @Req() req,
//   ) {
//     let resultAllPosts;
//     if (!req.user) {
//       resultAllPosts = await this.commandBus.execute(
//         new GetPostsUseCaseCommand(postPagination),
//       );
//       return res.status(200).send(resultAllPosts);
//     }
//     resultAllPosts = await this.commandBus.execute(
//       new GetPostsForUserUseCaseCommand(postPagination, req.user.id),
//     );
//     return res.status(200).send(resultAllPosts);
//   }
//   @Get('/:id')
//   @UseGuards(IdenteficationUserGuard)
//   async getPost(@Param('id') postId: string, @Res() res, @Req() req) {
//     let post;
//     if (!req.user) {
//       post = await this.postService.getPost(postId);
//       return res.status(200).send(post);
//     }
//     post = await this.commandBus.execute(
//       new GetPostForUserUseCaseCommand(postId, req.user.id),
//     );
//     return res.status(200).send(post);
//   }
//   @UseGuards(BasicAuthorizationGuard)
//   @Put('/:id')
//   async updatePost(
//     @Param('id') postId: string,
//     @Body() updatePostDto: CreatePostDTO,
//     @Res() res: Response,
//   ) {
//     await this.commandBus.execute(
//       new UpdatePostUserCaseCommand(postId, updatePostDto),
//     );
//     return res.sendStatus(HttpStatus.NO_CONTENT);
//   }
//   @UseGuards(BasicAuthorizationGuard)
//   @Delete('/:id')
//   async deletePost(@Param('id') postId: string, @Res() res: Response) {
//     await this.commandBus.execute(new DeletePostUseCaseCommand(postId));
//     return res.sendStatus(HttpStatus.NO_CONTENT);
//   }
//   @UseGuards(BearerGuard)
//   @Post('/:postId/comments')
//   async createCommentForPost(
//     @Param('postId') postId: string,
//     @Body() createCommentDto: CreateCommentDto,
//     @Res() res: Response,
//     @Req() req,
//   ) {
//     await this.postService.getPost(postId);
//     const addCommentByPostReturnIdComment = await this.commandBus.execute(
//       new CreateCommentForPostUseCaseCommand(
//         postId,
//         createCommentDto.content,
//         req.user,
//       ),
//     ); //return id new comment
//     const newCommentByPost = await this.commandBus.execute(
//       new GetCommentViewModelUseCaseCommand(addCommentByPostReturnIdComment),
//     );
//     return res.status(201).send(newCommentByPost);
//   }
//   @UseGuards(IdenteficationUserGuard)
//   @Get('/:postId/comments')
//   async getCommentsForPost(
//     @Query() getPagination: PaginationDTO,
//     @Param('postId') postId: string,
//     @Res() res: Response,
//     @Req() req,
//   ) {
//     await this.postService.getPost(postId);
//     let resultAllCommentsByPosts;
//     if (!req.user) {
//       resultAllCommentsByPosts = await this.commandBus.execute(
//         new GetCommentsForPostUseCaseCommand(getPagination, postId),
//       );
//       return res.status(200).send(resultAllCommentsByPosts);
//     }
//     resultAllCommentsByPosts = await this.commandBus.execute(
//       new GetCommentsForPostForUserUseCaseCommand(
//         getPagination,
//         postId,
//         req.user.id,
//       ),
//     );
//     return res.status(200).send(resultAllCommentsByPosts);
//   }
//   @UseGuards(BearerGuard)
//   @Put('/:id/like-status')
//   async updateLikeStatus(
//     @Req() req,
//     @Res() res,
//     @Param('id') postId: string,
//     @Body() updateLikeStatus: UpdateLikeStatusDto,
//   ) {
//     await this.commandBus.execute(
//       new UpdateLikeStatusPostUseCaseCommand(
//         postId,
//         updateLikeStatus.likeStatus,
//         req.user,
//       ),
//     );
//
//     return res.sendStatus(204);
//   }
// }
