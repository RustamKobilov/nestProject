import { PostRepository } from '../../Post/postRepository';
import { PaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { helper } from '../../helper';

export class GetPostByBlogForUserCommand {
  constructor(
    public blogId: string,
    public getPagination: PaginationDTO,
    public userId: string,
  ) {}
}
@CommandHandler(GetPostByBlogForUserCommand)
export class GetPostByBlogForUser {
  constructor(private postRepository: PostRepository) {}
  async execute(command: GetPostByBlogForUserCommand) {
    const filter = { blogId: command.blogId };
    const pagination = helper.getCommentPaginationValues(command.getPagination);
    return await this.postRepository.getPostsForUser(
      filter,
      pagination,
      command.userId,
    );
  }
}
