import { CreatePostByBlogDTO, CreatePostDTO } from '../../DTO';
import { NotFoundException } from '@nestjs/common';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../blogRepository';
import { PostService } from '../../Post/postService';

export class CreatePostByBlogCommand {
  constructor(
    public createPostByBlogDTO: CreatePostByBlogDTO,
    public blogId: string,
  ) {}
}

@CommandHandler(CreatePostByBlogCommand)
export class CreatePostByBlog {
  constructor(
    private blogRepository: BlogRepository,
    private postService: PostService,
  ) {}
  async execute(command: CreatePostByBlogCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const postByBlog: CreatePostDTO = {
      title: command.createPostByBlogDTO.title,
      shortDescription: command.createPostByBlogDTO.shortDescription,
      content: command.createPostByBlogDTO.content,
    };
    return this.postService.createNewPost(postByBlog, command.blogId);
  }
}
