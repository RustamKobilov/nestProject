import { PaginationDTO } from '../../DTO';
import { CommentRepository } from '../../Comment/commentRepository';
import { CommandHandler } from '@nestjs/cqrs';
import { helper } from '../../helper';

export class GetCommentsForAllPostBloggerUseCaseCommand {
  constructor(public pagination: PaginationDTO, public userId: string) {}
}
@CommandHandler(GetCommentsForAllPostBloggerUseCaseCommand)
export class GetCommentsForAllPostBloggerUseCase {
  constructor(private commentRepository: CommentRepository) {}
  async execute(command: GetCommentsForAllPostBloggerUseCaseCommand) {
    const filter = { userId: command.userId };
    const pagination = helper.getCommentPaginationValues(command.pagination);
    return await this.commentRepository.getCommentsForPostBlogger(
      pagination,
      filter,
    );
  }
}
