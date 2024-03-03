import { Express } from 'express';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../Blog/blogRepository';
import { ImageService } from '../../Images/imageService';
import { ImagesRepository } from '../../Images/imageRepository';
import { S3StorageAdapter } from '../../adapters/s3StarageAdapter';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import sharp, { Metadata } from 'sharp';
import {
  ImageFormat,
  ImagePurpose,
  SettingsExamplarImageMainForPost,
} from '../../Enum';
import { PostRepository } from '../../Post/postRepository';
import { PostImageEntity } from '../../Images/Entity/PostImage.Entity';
import { Buffer } from 'buffer';

export class CreateMainForPostForBloggerUseCaseCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
    public main: Express.Multer.File,
  ) {}
}
@CommandHandler(CreateMainForPostForBloggerUseCaseCommand)
export class CreateMainForPostForBloggerUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private postRepository: PostRepository,
    private imageService: ImageService,
    private imageRepository: ImagesRepository,
    private s3StorageAdapter: S3StorageAdapter,
    private configService: ConfigService,
  ) {}

  async execute(command: CreateMainForPostForBloggerUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException(
        'blogId not found for blog /CreateMainForPostForBloggerUseCase',
      );
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException(
        'blog ne User / CreateMainForPostForBloggerUseCase/',
      );
    }
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException(
        'postId not found post /CreateMainForPostForBloggerUseCase',
      );
    }
    if (blog.id !== post.blogId) {
      throw new ForbiddenException(
        'post ne bloga / CreateMainForPostForBloggerUseCase/',
      );
    }
    let uploadImageOriginal: string;
    let uploadImageMiddle: string;
    let uploadImageSmall: string;
    let urlDownloadOriginal: string;
    let urlDownloadMiddle: string;
    let urlDownloadSmall: string;

    const imageOriginalBuffer = await sharp(command.main.buffer).toBuffer({
      resolveWithObject: true,
    });
    const imageOriginal = await sharp(command.main.buffer).metadata();
    if (!imageOriginal.size) {
      throw new BadRequestException(
        'image = await sharp(command.wallpaper.buffer).metadata()',
      );
    }

    const middleImageBuffer = await sharp(command.main.buffer)
      .resize({
        width: SettingsExamplarImageMainForPost.middleWidth,
        height: SettingsExamplarImageMainForPost.middleHeight,
      })
      .toBuffer({ resolveWithObject: true }); //resize middle
    const middleImage = await sharp(command.main.buffer)
      .resize({
        width: SettingsExamplarImageMainForPost.middleWidth,
        height: SettingsExamplarImageMainForPost.middleHeight,
      })
      .metadata();
    if (!middleImage.size) {
      throw new BadRequestException(
        'middleImage = await sharp(command.main.buffer)\n' +
          '      .resize({\n' +
          '        width: SettingsExamplarImageMainForPost.middleWidth,\n' +
          '        height: SettingsExamplarImageMainForPost.middleHeight,\n' +
          '      }).metadata()',
      );
    }

    const smallImageBuffer = await sharp(command.main.buffer)
      .resize({
        width: SettingsExamplarImageMainForPost.smallWidth,
        height: SettingsExamplarImageMainForPost.smallHeight,
      })
      .toBuffer({ resolveWithObject: true }); //resize middle
    const smallImage = await sharp(command.main.buffer)
      .resize({
        width: SettingsExamplarImageMainForPost.smallWidth,
        height: SettingsExamplarImageMainForPost.smallHeight,
      })
      .metadata();
    if (!smallImage.size) {
      throw new BadRequestException(
        'smallImage = await sharp(command.main.buffer)\n' +
          '      .resize({\n' +
          '        width: SettingsExamplarImageMainForPost.smallWidth,\n' +
          '        height: SettingsExamplarImageMainForPost.smallWidth,\n' +
          '      }).metadata()',
      );
    }

    try {
      uploadImageOriginal = await this.s3StorageAdapter.saveImageForParent(
        'original ' + command.main.originalname,
        imageOriginalBuffer.info.format,
        command.userId,
        command.postId,
        command.main.buffer,
        this.configService.get<string>('Yandex_Backet') as string,
        this.configService.get<string>('Yandex_Key_Images') as string,
        ImagePurpose.main,
      ); //save image cloudStorageOriginal
      uploadImageMiddle = await this.s3StorageAdapter.saveImageForParent(
        'middle ' + command.main.originalname,
        middleImageBuffer.info.format,
        command.userId,
        command.postId,
        middleImageBuffer.data,
        this.configService.get<string>('Yandex_Backet') as string,
        this.configService.get<string>('Yandex_Key_Images') as string,
        ImagePurpose.main,
      ); //save image cloudStorageMiddle
      uploadImageSmall = await this.s3StorageAdapter.saveImageForParent(
        'small ' + command.main.originalname,
        smallImageBuffer.info.format,
        command.userId,
        command.postId,
        smallImageBuffer.data,
        this.configService.get<string>('Yandex_Backet') as string,
        this.configService.get<string>('Yandex_Key_Images') as string,
        ImagePurpose.main,
      ); //save image cloudStorageSmall
      console.log('ss');
      urlDownloadOriginal = await this.s3StorageAdapter.getSecretDownloadUrl(
        uploadImageOriginal,
        command.userId,
        command.postId,
        this.configService.get<string>('Yandex_Backet') as string,
      ); //create urlDownloadImageOriginal
      urlDownloadMiddle = await this.s3StorageAdapter.getSecretDownloadUrl(
        uploadImageMiddle,
        command.userId,
        command.postId,
        this.configService.get<string>('Yandex_Backet') as string,
      ); //create urlDownloadImageMiddle
      console.log('sss');
      urlDownloadSmall = await this.s3StorageAdapter.getSecretDownloadUrl(
        uploadImageSmall,
        command.userId,
        command.postId,
        this.configService.get<string>('Yandex_Backet') as string,
      ); //create urlDownloadImageSmall
      console.log('ssss');
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        'upload original and middle and small image',
      );
    }

    const originalImageEntity: PostImageEntity = PostImageEntity.CreateEntity(
      uploadImageOriginal,
      urlDownloadOriginal,
      command.postId,
      new Date().toISOString(),
      imageOriginalBuffer.info.width as number,
      imageOriginalBuffer.info.height as number,
      imageOriginal.size as number,
      ImageFormat[imageOriginalBuffer.info.format],
      ImagePurpose.main,
    );
    const middleImageEntity: PostImageEntity = PostImageEntity.CreateEntity(
      uploadImageMiddle,
      urlDownloadMiddle,
      command.postId,
      new Date().toISOString(),
      middleImageBuffer.info.width,
      middleImageBuffer.info.height,
      middleImage.size,
      ImageFormat[middleImageBuffer.info.format],
      ImagePurpose.main,
    );

    const smallImageEntity: PostImageEntity = PostImageEntity.CreateEntity(
      uploadImageSmall,
      urlDownloadSmall,
      command.postId,
      new Date().toISOString(),
      smallImageBuffer.info.width,
      smallImageBuffer.info.height,
      smallImage.size,
      ImageFormat[smallImageBuffer.info.format],
      ImagePurpose.main,
    );

    await this.imageRepository.CreateImageForPostImageRepository(
      originalImageEntity,
    ); //save image information in base
    await this.imageRepository.CreateImageForPostImageRepository(
      middleImageEntity,
    );
    await this.imageRepository.CreateImageForPostImageRepository(
      smallImageEntity,
    );
    return;
  }
}
