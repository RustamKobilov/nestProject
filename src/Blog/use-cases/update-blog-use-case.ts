import { BlogRepository } from '../blogRepository';
import { CreateBlogDTO } from '../../DTO';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

export class UpdateUseCaseCommand {
  constructor(public blogId: string, public updateBlogDto: CreateBlogDTO) {}
}
@CommandHandler(UpdateUseCaseCommand)
export class UpdateBlogUseCase {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: UpdateUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const updateBlog = await this.blogRepository.updateBlog(
      command.blogId,
      command.updateBlogDto,
    );
    if (!updateBlog) {
      throw new NotFoundException('blog not update /blogService');
    }
    return;
  }
}
