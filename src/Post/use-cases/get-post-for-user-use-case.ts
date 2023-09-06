import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../postRepository';
import { NotFoundException } from '@nestjs/common';

export class GetPostForUserUseCaseCommand {
  constructor(public postId: string, public userId: string) {}
}

@CommandHandler(GetPostForUserUseCaseCommand)
export class GetPostForUserUseCase {
  constructor(private postRepository: PostRepository) {}
  async execute(command: GetPostForUserUseCaseCommand) {
    const post = await this.postRepository.getPost(command.postId);
    if (!post) {
      throw new NotFoundException('postId not found post /postService');
    }
    return this.postRepository.getPostForUser(command.postId, command.userId);
  }
}
