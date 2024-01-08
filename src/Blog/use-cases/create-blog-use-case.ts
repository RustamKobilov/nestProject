import { CreateBlogDTO } from '../../DTO';
import { BlogViewModel } from '../../viewModelDTO';
import { Blog } from '../Blog';
import { randomUUID } from 'crypto';
import { mapObject } from '../../mapObject';
import { BlogRepository } from '../blogRepository';
import { CommandHandler } from '@nestjs/cqrs';

export class CreateBlogUseCaseCommand {
  constructor(public createBlogDto: CreateBlogDTO, public userId: string) {}
}
@CommandHandler(CreateBlogUseCaseCommand)
export class CreateBlogUseCase {
  constructor(private blogRepository: BlogRepository) {}

  async execute(command: CreateBlogUseCaseCommand): Promise<BlogViewModel> {
    const blog: Blog = {
      id: randomUUID(),
      userId: command.userId,
      name: command.createBlogDto.name,
      description: command.createBlogDto.description,
      websiteUrl: command.createBlogDto.websiteUrl,
      createdAt: new Date().toISOString(),
      isMembership: false,
    };
    await this.blogRepository.createBlog(blog);
    const outputBlogModel = mapObject.mapBlogForViewModel(blog);
    return outputBlogModel;
  }
}
