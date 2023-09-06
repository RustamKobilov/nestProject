import { PaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { PostRepository } from '../postRepository';
import { helper } from '../../helper';

export class GetPostsUseCaseCommand {
  constructor(public postPagination: PaginationDTO) {}
}
@CommandHandler(GetPostsUseCaseCommand)
export class GetPostsUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(command: GetPostsUseCaseCommand) {
    const pagination = helper.getPostPaginationValues(command.postPagination);
    return this.postRepository.getPosts(pagination);
  }
}
