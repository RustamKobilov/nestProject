import { CreatePostByBlogDTO, CreatePostDTO } from '../../DTO';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../blogRepository';
import { PostService } from '../../Post/postService';

export class CreatePostByBlogCommand {
  constructor(
    public createPostByBlogDTO: CreatePostByBlogDTO,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlogUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private postService: PostService,
  ) {}
  async execute(command: CreatePostByBlogCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    const postByBlog: CreatePostDTO = {
      title: command.createPostByBlogDTO.title,
      shortDescription: command.createPostByBlogDTO.shortDescription,
      content: command.createPostByBlogDTO.content,
    };
    return this.postService.createNewPost(postByBlog, command.blogId);
  }
}
