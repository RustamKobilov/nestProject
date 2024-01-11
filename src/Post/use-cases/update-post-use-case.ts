import { PostRepository } from '../postRepository';
import { BlogRepository } from '../../Blog/blogRepository';
import { CommandHandler } from '@nestjs/cqrs';
import { CreatePostDTO } from '../../DTO';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export class UpdatePostUserCaseCommand {
  constructor(
    public postId: string,
    public updatePostDto: CreatePostDTO,
    public blogId: string,
    public userId: string,
  ) {}
}
@CommandHandler(UpdatePostUserCaseCommand)
export class UpdatePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}
  async execute(command: UpdatePostUserCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException('blogId not found blogs /postService');
    }
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    const updatePost = await this.postRepository.updatePost(
      command.postId,
      command.updatePostDto,
      command.blogId,
    );
    if (!updatePost) {
      throw new NotFoundException('postId not update post /postService');
    }
    return;
  }
}
