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
import sharp from 'sharp';
import { ImageFormat, ImagePurpose } from '../../Enum';
import { BlogImageEntity } from '../../Images/Entity/BlogImage.Entity';

export class CreateMainForBlogForBloggerUseCaseCommand {
  constructor(
    public blogId: string,
    public userId: string,
    public main: Express.Multer.File,
  ) {}
}
@CommandHandler(CreateMainForBlogForBloggerUseCaseCommand)
export class CreateMainForBlogForBloggerUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private imageService: ImageService,
    private imageRepository: ImagesRepository,
    private s3StorageAdapter: S3StorageAdapter,
    private configService: ConfigService,
  ) {}

  async execute(command: CreateMainForBlogForBloggerUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    const imageBuffer = await sharp(command.main.buffer).toBuffer({
      resolveWithObject: true,
    });
    const image = await sharp(command.main.buffer).metadata();
    if (!image) {
      throw new BadRequestException(
        'image = await sharp(command.wallpaper.buffer).metadata()',
      );
    }
    let uploadImage: string;
    let urlDownload: string;
    //main
    try {
      uploadImage = await this.s3StorageAdapter.saveImageForParent(
        command.main.originalname,
        imageBuffer.info.format,
        command.userId,
        command.blogId,
        command.main.buffer,
        this.configService.get<string>('Yandex_Backet') as string,
        this.configService.get<string>('Yandex_Key_Images') as string,
        ImagePurpose.main,
      ); //save image cloudStorage
      urlDownload = await this.s3StorageAdapter.getSecretDownloadUrl(
        uploadImage,
        command.userId,
        command.blogId,
        this.configService.get<string>('Yandex_Backet') as string,
      ); //create urlDownload
    } catch (e) {
      console.log(e);
      throw new BadRequestException(
        'upload original and middle and small image',
      );
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
      ImagePurpose.main,
    );

    await this.imageRepository.CreateImageForBlogImageRepository(imageEntity); //save image information in base
    return;
  }
}
