import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../postRepository';
import { NotFoundException } from '@nestjs/common';

export class DeletePostUseCaseCommand {
  constructor(public postId: string) {}
}

@CommandHandler(DeletePostUseCaseCommand)
export class DeletePostUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(command: DeletePostUseCaseCommand) {
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    return this.postRepository.deletePost(command.postId);
  }
}
