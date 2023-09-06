import { helper } from '../../helper';
import { PostRepository } from '../postRepository';
import { PaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';

export class GetPostsForUserUseCaseCommand {
  constructor(public postPagination: PaginationDTO, public userId: string) {}
}
@CommandHandler(GetPostsForUserUseCaseCommand)
export class GetPostsForUserUseCase {
  constructor(private postRepository: PostRepository) {}

  async execute(command: GetPostsForUserUseCaseCommand) {
    const filter = {};
    const pagination = helper.getCommentPaginationValues(
      command.postPagination,
    );
    return await this.postRepository.getPostsForUser(
      filter,
      pagination,
      command.userId,
    );
  }
}
