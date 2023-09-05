import { NotFoundException } from '@nestjs/common';
import { helper } from '../../helper';
import { BlogRepository } from '../blogRepository';
import { PaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { PostService } from '../../Post/postService';

export class GetPostByBlogCommand {
  constructor(public blogId: string, public postPagination: PaginationDTO) {}
}
@CommandHandler(GetPostByBlogCommand)
export class GetPostByBlog {
  constructor(
    private blogRepository: BlogRepository,
    private postService: PostService,
  ) {}
  async execute(command: GetPostByBlogCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    const pagination = helper.getPostPaginationValues(command.postPagination);
    const filter = { blogId: command.blogId };
    return this.postService.getPostsByBlog(pagination, filter);
  }
}
