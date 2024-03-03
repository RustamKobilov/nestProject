import { BlogRepository } from '../blogRepository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteBlogUseCaseCommand {
  constructor(public blogId: string, public userId: string) {}
}
@CommandHandler(DeleteBlogUseCaseCommand)
export class DeleteBlogUseCase {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: DeleteBlogUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    //TODO удалять все посты в юскейсе
    await this.blogRepository.deleteBlog(command.blogId);
    return;
  }
}
