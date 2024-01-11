import { helper } from '../../helper';
import { BlogRepository } from '../blogRepository';
import { CommandHandler } from '@nestjs/cqrs';
import { BlogPaginationDTO } from '../../DTO';

export class GetBlogsForSaUseCaseCommand {
  constructor(public blogPagination: BlogPaginationDTO) {}
}

@CommandHandler(GetBlogsForSaUseCaseCommand)
export class GetBlogsForSaUseCase {
  constructor(private blogRepository: BlogRepository) {}
  async execute(command: GetBlogsForSaUseCaseCommand) {
    const pagination = helper.getBlogPaginationValues(command.blogPagination);
    const searchNameTermFilter =
      this.blogRepository.getSearchNameTermFilterBlog(command.blogPagination);
    return this.blogRepository.getBlogsForSa(pagination, searchNameTermFilter);
  }
}
