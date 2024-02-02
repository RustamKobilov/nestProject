import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { helper } from '../../helper';
import { BlogRepository } from '../blogRepository';
import { PaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { PostService } from '../../Post/postService';
import { PostRepository } from '../../Post/postRepository';

export class GetPostByBlogForBloggerCommand {
  constructor(
    public blogId: string,
    public postPagination: PaginationDTO,
    public userId: string,
  ) {}
}
@CommandHandler(GetPostByBlogForBloggerCommand)
export class GetPostByBlogForBloggerUseCase {
  constructor(
    private blogRepository: BlogRepository,
    private postRepository: PostRepository,
  ) {}
  async execute(command: GetPostByBlogForBloggerCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found for blog /blogService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    const pagination = helper.getPostPaginationValues(command.postPagination);
    return await this.postRepository.getPostsForBlogByBlogger(
      pagination,
      command.blogId,
      command.userId,
    );
  }
}
