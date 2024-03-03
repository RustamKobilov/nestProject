import { ImagesRepository } from '../../Images/imageRepository';
import { PostRepository } from '../../Post/postRepository';
import { BlogRepository } from '../../Blog/blogRepository';
import { CommandHandler } from '@nestjs/cqrs';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PostImagesViewModel } from '../../viewModelDTO';
import { mapObject } from '../../mapObject';
import { countMainImageForPost } from '../../constant';

export class GetImagesForPostForBloggerUseCaseCommand {
  constructor(
    public blogId: string,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(GetImagesForPostForBloggerUseCaseCommand)
export class GetImagesForPostForBloggerUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private postRepository: PostRepository,
    private imageRepository: ImagesRepository,
  ) {}

  async execute(
    command: GetImagesForPostForBloggerUseCaseCommand,
  ): Promise<PostImagesViewModel> {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException(
        'blogId not found for blog /GetImagesForPostForBloggerUseCase',
      );
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException(
        'blog ne User / GetImagesForPostForBloggerUseCase/',
      );
    }
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException(
        'postId not found post /GetImagesForPostForBloggerUseCase',
      );
    }
    if (blog.id !== post.blogId) {
      throw new ForbiddenException(
        'post ne bloga / GetImagesForPostForBloggerUseCase/',
      );
    }

    const imagesForPost =
      await this.imageRepository.getImageForPostImageRepository(command.postId);

    const postImagesViewModel =
      mapObject.mapPostImageForViewModel(imagesForPost);

    if (postImagesViewModel.main.length < countMainImageForPost) {
      console.log(postImagesViewModel);
      throw new BadRequestException('postImagesViewModel 3 exemplar');
    }

    return postImagesViewModel;
  }
}
