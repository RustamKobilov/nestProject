import { SkipThrottle } from '@nestjs/throttler';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import {
  BlogPaginationDTO,
  CreateBlogDTO,
  CreatePostByBlogDTO,
  CreatePostDTO,
  PaginationBloggerBanListDTO,
  PaginationDTO,
  UpdateBanStatusUserForBlogDTO,
} from '../DTO';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import { GetBlogsForBloggerUseCaseCommand } from './use-cases/get-blogs-for-blogger-use-case';
import { CreateBlogUseCaseCommand } from '../Blog/use-cases/create-blog-use-case';
import { Express, Response } from 'express';
import { UpdateUseCaseCommand } from '../Blog/use-cases/update-blog-use-case';
import { DeleteBlogUseCaseCommand } from '../Blog/use-cases/delete-blog-use-case';
import { CreatePostByBlogCommand } from '../Blog/use-cases/create-post-by-blog-use-case';
import { UpdatePostUserCaseCommand } from '../Post/use-cases/update-post-use-case';
import { DeletePostUseCaseCommand } from '../Post/use-cases/delete-post-use-case';
import { GetPostByBlogForBloggerCommand } from '../Blog/use-cases/get-post-by-blog-for-blogger-use-case';
import { UpdateBanUserForBlogUseCaseCommand } from '../ParentBanList/use-case/update-ban-all-parent-for-blog';
import { GetAllUserBannedForParentUseCaseCommand } from '../ParentBanList/use-case/get-all-user-banned-for-parent-use-case';
import { GetCommentsForAllPostBloggerUseCaseCommand } from './use-cases/get-comments-for-blogger-use-case';
import { CreateWallpaperForBlogForBloggerUseCaseCommand } from './use-cases/create-wallpaper-for-blog-for-blogger-use-case';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateMainForBlogForBloggerUseCaseCommand } from './use-cases/create-main-for-blog-for-blogger-use-case';
import { GetImagesForBlogForBloggerUseCaseCommand } from './use-cases/get-images-for-blog-for-blogger-use-case';
import { CreateMainForPostForBloggerUseCaseCommand } from './use-cases/create-main-for-post-for-blogger-use-case';
import { GetImagesForPostForBloggerUseCaseCommand } from './use-cases/get-images-for-post-for-blogger-use-case';
import { CustomUploadFileTypeValidator } from '../pipes/customImagePipes';
import {
  ImageFormatBackgroundWallpaperForBlog,
  ImageFormatMainForBlog,
  ImageFormatMainForPost,
  SettingsImageBackgroundWallpaperForBlog,
  SettingsImageMainForBlog,
  SettingsImageMainForPost,
} from '../Enum';
import { readTextFileAsync } from '../avatar/utils/fs.utils';
import path from 'node:path';

@SkipThrottle()
@Controller('blogger/blogs')
export class BloggerController {
  constructor(private commandBus: CommandBus) {}

  @UseGuards(BearerGuard)
  @Post()
  async createBlog(
    @Body() createBlogDto: CreateBlogDTO,
    @Res() res,
    @Req() req,
  ) {
    const blog = await this.commandBus.execute(
      new CreateBlogUseCaseCommand(createBlogDto, req.user.id, req.user.login),
    );
    res.status(201).send(blog);
  }

  @UseGuards(BearerGuard)
  @Get()
  async getBlogs(
    @Query() blogPagination: BlogPaginationDTO,
    @Res() res,
    @Req() req,
  ) {
    const blogs = await this.commandBus.execute(
      new GetBlogsForBloggerUseCaseCommand(blogPagination, req.user.id),
    );
    res.status(200).send(blogs);
  }

  @UseGuards(BearerGuard)
  @Put('/:id')
  async updateBlog(
    @Param('id') blogId: string,
    @Body() updateBlogDto: CreateBlogDTO,
    @Res() res,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdateUseCaseCommand(blogId, updateBlogDto, req.user.id),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BearerGuard)
  @Delete('/:id')
  async deleteBlog(@Param('id') blogId: string, @Res() res, @Req() req) {
    await this.commandBus.execute(
      new DeleteBlogUseCaseCommand(blogId, req.user.id),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BearerGuard)
  @Post('/:id/posts')
  async createPostByBlog(
    @Body() createPostDto: CreatePostByBlogDTO,
    @Param('id') blogId: string,
    @Res() res,
    @Req() req,
  ) {
    const posts = await this.commandBus.execute(
      new CreatePostByBlogCommand(createPostDto, blogId, req.user.id),
    );
    return res.status(201).send(posts);
  }

  @UseGuards(BearerGuard)
  @Get('/:id/posts')
  async getPostsByBlog(
    @Query() getPagination: PaginationDTO,
    @Param('id') blogId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const resultAllPostsByBlog = await this.commandBus.execute(
      new GetPostByBlogForBloggerCommand(blogId, getPagination, req.user.id),
    );
    return res.status(200).send(resultAllPostsByBlog);
  }

  @UseGuards(BearerGuard)
  @Put('/:id/posts/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Body() updatePostDto: CreatePostDTO,
    @Res() res: Response,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdatePostUserCaseCommand(postId, updatePostDto, blogId, req.user.id),
    );

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }

  @UseGuards(BearerGuard)
  @Delete('/:id/posts/:postId')
  async deletePost(
    @Param('postId') postId: string,
    @Param('id') blogId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new DeletePostUseCaseCommand(postId, blogId, req.user.id),
    );
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BearerGuard)
  @Get('/comments')
  async getCommentsForBlogger(
    @Query() pagination: PaginationDTO,
    @Res() res,
    @Req() req,
  ) {
    const comments = await this.commandBus.execute(
      new GetCommentsForAllPostBloggerUseCaseCommand(pagination, req.user.id),
    );
    return res.status(200).send(comments);
  }
  @UseGuards(BearerGuard)
  @Post('/:id/images/wallpaper')
  @UseInterceptors(FileInterceptor('file'))
  async createWallpaperImageForBlog(
    @Param('id') blogId: string,
    @Res() res,
    @Req() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: Object.values(ImageFormatBackgroundWallpaperForBlog),
            imageHeight: SettingsImageBackgroundWallpaperForBlog.height,
            imageSize: SettingsImageBackgroundWallpaperForBlog.size,
            imageWidth: SettingsImageBackgroundWallpaperForBlog.width,
          }),
        )
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    wallpaperFile: Express.Multer.File,
  ) {
    const createWallpaper = await this.commandBus.execute(
      new CreateWallpaperForBlogForBloggerUseCaseCommand(
        blogId,
        req.user.id /*'admin'*/,
        wallpaperFile,
      ),
    );
    const blogImagesViewModel = await this.commandBus.execute(
      new GetImagesForBlogForBloggerUseCaseCommand(
        blogId,
        req.user.id /*'admin'*/,
      ),
    );
    return res.status(201).send(blogImagesViewModel);
  }
  @UseGuards(BearerGuard)
  @Post('/:id/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async createMainImageForBlog(
    @Param('id') blogId: string,
    @Res() res,
    @Req() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: Object.values(ImageFormatMainForBlog),
            imageHeight: SettingsImageMainForBlog.height,
            imageSize: SettingsImageMainForBlog.size,
            imageWidth: SettingsImageMainForBlog.width,
          }),
        )
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    mainFile: Express.Multer.File,
  ) {
    const main = await this.commandBus.execute(
      new CreateMainForBlogForBloggerUseCaseCommand(
        blogId,
        req.user.id /*'admin'*/,
        mainFile,
      ),
    );
    const blogImagesViewModel = await this.commandBus.execute(
      new GetImagesForBlogForBloggerUseCaseCommand(
        blogId,
        req.user.id /*'admin'*/,
      ),
    );
    return res.status(201).send(blogImagesViewModel);
  }
  @UseGuards(BearerGuard)
  @Post('/:id/posts/:postId/images/main')
  @UseInterceptors(FileInterceptor('file'))
  async createMainImageForPost(
    @Param('id') blogId: string,
    @Param('postId') postId: string,
    @Res() res,
    @Req() req,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addValidator(
          new CustomUploadFileTypeValidator({
            fileType: Object.values(ImageFormatMainForPost),
            imageHeight: SettingsImageMainForPost.height,
            imageSize: SettingsImageMainForPost.size,
            imageWidth: SettingsImageMainForPost.width,
          }),
        )
        .build({ errorHttpStatusCode: HttpStatus.BAD_REQUEST }),
    )
    wallpaperFile: Express.Multer.File,
  ) {
    const main = await this.commandBus.execute(
      new CreateMainForPostForBloggerUseCaseCommand(
        blogId,
        postId,
        req.user.id /*'admin'*/,
        wallpaperFile,
      ),
    );
    const postImagesViewModel = await this.commandBus.execute(
      new GetImagesForPostForBloggerUseCaseCommand(
        blogId,
        postId,
        req.user.id /*'admin'*/,
      ),
    );
    return res.status(201).send(postImagesViewModel);
  }
  @Get('/file')
  async getChangeAvatar(req: Request, res: Response) {
    const content = await readTextFileAsync(
      path.join('views', 'changePage.html'),
    );
    //console.log(pathFinish);
    //console.log(__dirname);
    return content;
  }
}
@SkipThrottle()
@Controller('blogger/users')
export class BloggerUserController {
  constructor(private commandBus: CommandBus) {}
  @UseGuards(BearerGuard)
  @Put('/:id/ban/')
  async updateUserBanStatusForBlog(
    @Param('id') userId: string,
    @Body() updateBanStatusUserForBlogDTO: UpdateBanStatusUserForBlogDTO,
    @Res() res: Response,
    @Req() req,
  ) {
    await this.commandBus.execute(
      new UpdateBanUserForBlogUseCaseCommand(
        req.user.id,
        userId,
        updateBanStatusUserForBlogDTO,
      ),
    );

    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
  @UseGuards(BearerGuard)
  @Get('/blog/:id/')
  async getPostsByBlog(
    @Query() pagination: PaginationBloggerBanListDTO,
    @Param('id') blogId: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const resultAllUsersBannedForBlog = await this.commandBus.execute(
      new GetAllUserBannedForParentUseCaseCommand(
        req.user.id,
        pagination,
        blogId,
      ),
    );
    return res.status(200).send(resultAllUsersBannedForBlog);
  }
}
