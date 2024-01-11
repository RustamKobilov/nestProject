import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../blogRepository';
import { NotFoundException } from '@nestjs/common';
import { mapObject } from '../../mapObject';

export class GetBlogUseCaseCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(GetBlogUseCaseCommand)
export class GetBlogUseCase {
  constructor(private blogRepository: BlogRepository) {}
  async execute(command: GetBlogUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const outputBlogModel = mapObject.mapBlogForViewModel(blog);
    return outputBlogModel;
  }
}
