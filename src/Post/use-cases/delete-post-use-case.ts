import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../postRepository';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { BlogRepository } from '../../Blog/blogRepository';

export class DeletePostUseCaseCommand {
  constructor(
    public postId: string,
    public blogId: string,
    public userId: string,
  ) {}
}

@CommandHandler(DeletePostUseCaseCommand)
export class DeletePostUseCase {
  constructor(
    private postRepository: PostRepository,
    private blogRepository: BlogRepository,
  ) {}

  async execute(command: DeletePostUseCaseCommand) {
    const blog = await this.blogRepository.getBlog(command.blogId);
    if (!blog) {
      throw new NotFoundException(
        'blogId not found blog /DeletePostUseCaseCommand',
      );
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException('blog ne User / UpdateBlogUseCase/');
    }
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException(
        'postId not found post /DeletePostUseCaseCommand',
      );
    }

    return this.postRepository.deletePost(command.postId);
  }
}
