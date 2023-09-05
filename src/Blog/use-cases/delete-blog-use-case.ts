import { BlogRepository } from '../blogRepository';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

export class DeleteBlogUseCaseCommand {
  constructor(public blogId: string) {}
}
@CommandHandler(DeleteBlogUseCaseCommand)
export class DeleteBlogUseCase {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: DeleteBlogUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    await this.blogRepository.deleteBlog(command.blogId);
    return;
  }
}
