import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../blogRepository';
import { NotFoundException } from '@nestjs/common';
import { mapObject } from '../../mapObject';
import {
  countMainImageForBlog,
  countWallpaperImageForBlog,
} from '../../constant';
import { ImagePurpose } from '../../Enum';
import { ImagesRepository } from '../../Images/imageRepository';

export class GetBlogUseCaseCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogUseCaseCommand)
export class GetBlogUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private imageRepository: ImagesRepository,
  ) {}
  async execute(command: GetBlogUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }

    const imageWallpaper =
      await this.imageRepository.getImageForBlogByLimitAndPurpose(
        blog.id,
        countWallpaperImageForBlog,
        ImagePurpose.wallpaper,
      );
    console.log(imageWallpaper);
    const imageMain =
      await this.imageRepository.getImageForBlogByLimitAndPurpose(
        blog.id,
        countMainImageForBlog,
        ImagePurpose.main,
      );
    const blogViewModel = mapObject.mapBlogForViewModel(
      blog,
      imageWallpaper,
      imageMain,
    );
    return blogViewModel;
  }
}
