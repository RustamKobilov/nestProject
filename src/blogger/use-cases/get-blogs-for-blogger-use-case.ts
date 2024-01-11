import { BlogPaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogRepository } from '../../Blog/blogRepository';
import { helper } from '../../helper';

export class GetBlogsForBloggerUseCaseCommand {
  constructor(
    public blogPagination: BlogPaginationDTO,
    public userId: string,
  ) {}
}

@CommandHandler(GetBlogsForBloggerUseCaseCommand)
export class GetBlogsUseForBloggerCase {
  constructor(private blogRepository: BlogRepository) {}
  async execute(command: GetBlogsForBloggerUseCaseCommand) {
    const pagination = helper.getBlogPaginationValues(command.blogPagination);
    const searchNameTermFilter =
      this.blogRepository.getSearchNameTermFilterBlog(command.blogPagination);
    return this.blogRepository.getBlogsForBlogger(
      pagination,
      searchNameTermFilter,
      command.userId,
    );
  }
}
