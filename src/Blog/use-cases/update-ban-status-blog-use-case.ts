import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../blogRepository';
import { BadRequestException } from '@nestjs/common';

export class UpdateBanStatusBlogUseCaseCommand {
  constructor(public blogId: string, public isBanned: boolean) {}
}

@CommandHandler(UpdateBanStatusBlogUseCaseCommand)
export class UpdateBanStatusBlogUseCase {
  constructor(private blogRepository: BlogRepository) {}
  async execute(command: UpdateBanStatusBlogUseCaseCommand) {
    console.log(command.blogId);
    const blog = await this.blogRepository.getBlog(command.blogId);
    console.log(blog);
    if (!blog) {
      throw new BadRequestException(
        'blogId not found,from blogRepository /UpdateBanStatusBlogUseCase',
      );
    }
    const checkUserParentBanList = await this.blogRepository.updateBlogVision(
      command.blogId,
      command.isBanned,
    );
    return;
  }
}
