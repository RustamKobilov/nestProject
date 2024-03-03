import { CommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { BlogRepository } from '../../Blog/blogRepository';
import { ImagesRepository } from '../../Images/imageRepository';
import { BlogImageEntity } from '../../Images/Entity/BlogImage.Entity';
import { ImageFormat, ImagePurpose } from '../../Enum';
import { Express } from 'express';
import { ImageService } from '../../Images/imageService';
import { S3StorageAdapter } from '../../adapters/s3StarageAdapter';
import { ConfigService } from '@nestjs/config';
import sharp, { Metadata } from 'sharp';

export class CreateWallpaperForBlogForBloggerUseCaseCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public wallpaper: Express.Multer.File,
  ) {}
}
@CommandHandler(CreateWallpaperForBlogForBloggerUseCaseCommand)
export class CreateWallpaperForBlogForBloggerUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private imageService: ImageService,
    private imageRepository: ImagesRepository,
    private s3StorageAdapter: S3StorageAdapter,
    private configService: ConfigService,
  ) {}
  async execute(command: CreateWallpaperForBlogForBloggerUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    const imageBuffer = await sharp(command.wallpaper.buffer).toBuffer({
      resolveWithObject: true,
    });
    const image = await sharp(command.wallpaper.buffer).metadata();
    if (!image.size) {
      throw new BadRequestException(
        'image = await sharp(command.wallpaper.buffer).metadata()',
      );
    }

    let uploadImage: string;
    let urlDownload: string;
    try {
      uploadImage = await this.s3StorageAdapter.saveImageForParent(
        command.wallpaper.originalname,
        imageBuffer.info.format,
        command.userId,
        command.blogId,
        command.wallpaper.buffer,
        this.configService.get<string>('Yandex_Backet') as string,
        this.configService.get<string>('Yandex_Key_Images') as string,
        ImagePurpose.wallpaper,
      ); //save image cloudStorage
      urlDownload = await this.s3StorageAdapter.getSecretDownloadUrl(
        uploadImage,
        command.userId,
        command.blogId,
        this.configService.get<string>('Yandex_Backet') as string,
      ); //create urlDownload
    } catch (e) {
      throw new BadRequestException('upload image');
    }

    const imageEntity: BlogImageEntity = BlogImageEntity.CreateEntity(
      uploadImage,
      urlDownload,
      command.blogId,
      new Date().toISOString(),
      imageBuffer.info.width as number,
      imageBuffer.info.height as number,
      image.size as number,
      ImageFormat[imageBuffer.info.format],
      ImagePurpose.wallpaper,
    );
    await this.imageRepository.CreateImageForBlogImageRepository(imageEntity); //save image information in base
    return;
  }
}
