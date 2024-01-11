import { BlogRepository } from '../blogRepository';
import { CreateBlogDTO } from '../../DTO';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';

export class UpdateUseCaseCommand {
  constructor(
    public blogId: string,
    public updateBlogDto: CreateBlogDTO,
    public userId: string,
  ) {}
}
@CommandHandler(UpdateUseCaseCommand)
export class UpdateBlogUseCase {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: UpdateUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
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
