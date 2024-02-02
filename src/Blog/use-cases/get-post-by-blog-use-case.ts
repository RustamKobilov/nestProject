import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { helper } from '../../helper';
import { BlogRepository } from '../blogRepository';
import { PaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { PostService } from '../../Post/postService';
import { PostRepository } from '../../Post/postRepository';

export class GetPostByBlogCommand {
  constructor(public blogId: string, public postPagination: PaginationDTO) {}
}
@CommandHandler(GetPostByBlogCommand)
export class GetPostByBlogUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private postRepository: PostRepository,
  ) {}
  async execute(command: GetPostByBlogCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const pagination = helper.getPostPaginationValues(command.postPagination);
    return await this.postRepository.getPostsForBlog(
      pagination,
      command.blogId,
    );
  }
}
