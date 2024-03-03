import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../blogRepository';
import { BadRequestException } from '@nestjs/common';
import { PostRepository } from '../../Post/postRepository';

export class UpdateBanStatusBlogUseCaseCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(UpdateBanStatusBlogUseCaseCommand)
export class UpdateBanStatusBlogUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private postRepository: PostRepository,
  ) {}
  async execute(command: UpdateBanStatusBlogUseCaseCommand) {
    console.log(command.blogId);
    const blog = await this.blogRepository.getBlog(command.blogId);
    console.log(blog);
    if (!blog) {
      throw new BadRequestException(
        'blogId not found,from blogRepository /UpdateBanStatusBlogUseCase',
      );
    }
    if (blog.vision === command.isBanned) {
      const changeStatus = command.isBanned === true ? false : true;
      console.log('change status Blog and AllPostForBlog');
      const updateBlogBanStatus = await this.blogRepository.updateBlogVision(
        command.blogId,
        changeStatus,
      );
      const updateVisionPostForBlog =
        await this.postRepository.updatePostVisionForBlog(
          command.blogId,
          changeStatus,
        );
    }
    console.log('UpdateBanStatusBlogUseCase');
    return;
  }
}
