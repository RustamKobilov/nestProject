import {
  BadRequestException,
  Controller,
  Get,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { S3StorageAdapter } from '../adapters/s3StarageAdapter';
import { ConfigService } from '@nestjs/config';
import { BearerGuard } from '../auth/Guard/bearerGuard';
import sharp from 'sharp';
import path from 'node:path';
import { readTextFileAsync } from './utils/fs.utils';
import { ImageService } from '../Images/imageService';
import {
  ImageFormatBackgroundWallpaperForBlog,
  SettingsImageBackgroundWallpaperForBlog,
} from '../Enum';
import { CustomUploadFileTypeValidator } from '../pipes/customImagePipes';

@Controller('/avatar')
export class AvatarController {
  constructor(
    private s3Adapter: S3StorageAdapter,
    private configService: ConfigService,
    private imageService: ImageService,
  ) {}
  @Get()
  async getChangeAvatar(req: Request, res: Response) {
    const content = await readTextFileAsync(
      path.join('views', 'changePage.html'),
    );
    //console.log(pathFinish);
    //console.log(__dirname);
    return content;
  }

  @Post()
  //@UseGuards(BearerGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  async postChangeAvatar(
    req,
    res: Response,
    // @UploadedFile(
    //   new ParseFilePipeBuilder().addValidator(
    //     new CustomUploadFileTypeValidator({
    //       fileType: Object.values(ImageFormatBackgroundWallpaperForBlog),
    //       imageHeight: SettingsImageBackgroundWallpaperForBlog.height,
    //       imageSize: SettingsImageBackgroundWallpaperForBlog.size,
    //       imageWidth: SettingsImageBackgroundWallpaperForBlog.width,
    //     }),
    //   )
    // avatarFile: Express.Multer.File,
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
    avatarFile,
  ) {
    console.log(avatarFile);
    console.log(avatarFile.originalname);
    console.log(avatarFile.mimetype);

    return true;
  }
  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file'))
  // public async uploadFile(
  //   @UploadedFile(
  //     new ParseFilePipeBuilder()
  //       .addValidator(
  //         new CustomUploadFileTypeValidator({
  //           fileType: VALID_UPLOADS_MIME_TYPES,
  //         }),
  //       )
  //       .addMaxSizeValidator({ maxSize: MAX_PROFILE_PICTURE_SIZE_IN_BYTES })
  //       .build({ errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY }),
  //   )
  //     file,
  // )

  // @Delete('/delete/:id')
  //   // @UseGuards(BearerGuard)
  //   // async deleteAvatar(req: Request, res: Response, @Param('id') id: string) {
  //   //   const userId = req.user.id;
  //   //   await this.s3Adapter.deleteImage(id);
  //   //   return;
  //   // }
  // @Get('/secretUrl')
  // async getSecret(req: Request, res: Response, @Param('id') id: string) {
  //   const userId = '11223345';
  //   const payPosition = '333';
  //   const url = await this.s3Adapter.getSecretDownloadUrl(userId, payPosition);
  //   console.log(url);
  //   return url;
  // }
}
