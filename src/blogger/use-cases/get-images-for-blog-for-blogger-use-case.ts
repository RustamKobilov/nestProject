import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../Blog/blogRepository';
import { ImagesRepository } from '../../Images/imageRepository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { mapObject } from '../../mapObject';
import { BlogImagesViewModel } from '../../viewModelDTO';
import { countMainImageForBlog } from '../../constant';

export class GetImagesForBlogForBloggerUseCaseCommand {
  constructor(public blogId: string, public userId: string) {}
}
@CommandHandler(GetImagesForBlogForBloggerUseCaseCommand)
export class GetImagesForBlogForBloggerUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private imageRepository: ImagesRepository,
  ) {}

  async execute(
    command: GetImagesForBlogForBloggerUseCaseCommand,
  ): Promise<BlogImagesViewModel> {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    const imagesForBLog =
      await this.imageRepository.getImageForBlogImageRepository(command.blogId);
    const blogImagesViewModel =
      mapObject.mapBlogImageForViewModel(imagesForBLog);
    if (blogImagesViewModel.main.length > countMainImageForBlog) {
      blogImagesViewModel.main = blogImagesViewModel.main.slice(
        0,
        countMainImageForBlog,
      );
      console.log('throw new BadRequestException(main one image);');
      //throw new BadRequestException('blogImagesViewModel ');
      //console.log(blogImagesViewModel);
    }
    return blogImagesViewModel;
  }
}
