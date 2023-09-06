import { PostRepository } from '../postRepository';
import { BlogRepository } from '../../Blog/blogRepository';
import { CommandHandler } from '@nestjs/cqrs';
import { CreatePostDTO } from '../../DTO';
import { BadRequestException, NotFoundException } from '@nestjs/common';

export class UpdatePostUserCaseCommand {
  constructor(public postId: string, public updatePostDto: CreatePostDTO) {}
}
@CommandHandler(UpdatePostUserCaseCommand)
export class UpdatePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}
  async execute(command: UpdatePostUserCaseCommand) {
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    const blog = await this.blogRepository.getBlog(
      command.updatePostDto.blogId,
    );
    if (!blog) {
      throw new BadRequestException('blogId not found blogs /postService');
    }
    const updatePost = await this.postRepository.updatePost(
      command.postId,
      command.updatePostDto,
    );
    if (!updatePost) {
      throw new NotFoundException('postId not update post /postService');
    }
    return;
  }
}
