import { BlogPaginationDTO } from '../../DTO';
import { helper } from '../../helper';
import { BlogRepository } from '../blogRepository';
import { CommandHandler } from '@nestjs/cqrs';

export class GetBlogsUseCaseCommand {
  constructor(public blogPagination: BlogPaginationDTO) {}
}

@CommandHandler(GetBlogsUseCaseCommand)
export class GetBlogsUseCase {
  constructor(private blogRepository: BlogRepository) {}
  async execute(command: GetBlogsUseCaseCommand) {
    const pagination = helper.getBlogPaginationValues(command.blogPagination);
    const searchNameTermFilter = this.blogRepository.getFilterBlog(
      command.blogPagination,
    );
    return this.blogRepository.getBlogs(pagination, searchNameTermFilter);
  }
}
