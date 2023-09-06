import { CommandHandler } from '@nestjs/cqrs';
import { CommentRepository } from '../../Comment/commentRepository';
import { PaginationDTO } from '../../DTO';
import { helper } from '../../helper';

export class GetCommentsForPostUseCaseCommand {
  constructor(public getPagination: PaginationDTO, public postId: string) {}
}
@CommandHandler(GetCommentsForPostUseCaseCommand)
export class GetCommentsForPostUseCase {
  constructor(private commentRepository: CommentRepository) {}

  async execute(command: GetCommentsForPostUseCaseCommand) {
    const filter = { postId: command.postId };
    const pagination = helper.getCommentPaginationValues(command.getPagination);
    return await this.commentRepository.getCommentsForPost(pagination, filter);
  }
}
