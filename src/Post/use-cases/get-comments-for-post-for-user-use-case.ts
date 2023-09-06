import { PaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../Comment/commentRepository';
import { helper } from '../../helper';

export class GetCommentsForPostForUserUseCaseCommand {
  constructor(
    public getPagination: PaginationDTO,
    public postId: string,
    public userId: string,
  ) {}
}
@CommandHandler(GetCommentsForPostForUserUseCaseCommand)
export class GetCommentsForPostForUserUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: GetCommentsForPostForUserUseCaseCommand) {
    const filter = { postId: command.postId };
    const pagination = helper.getCommentPaginationValues(command.getPagination);
    return await this.commentRepository.getCommentsForPostUser(
      pagination,
      filter,
      command.userId,
    );
  }
}
