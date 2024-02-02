import { PaginationBloggerBanListDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { helper } from '../../helper';
import { ParentRepositoryTypeORM } from '../parentRepositoryTypeORM';
import { BlogRepository } from '../../Blog/blogRepository';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';

export class GetAllUserBannedForParentUseCaseCommand {
  constructor(
    public userId: string,
    public paginationBloggerBanListDTO: PaginationBloggerBanListDTO,
    public parentId: string,
  ) {}
}
@CommandHandler(GetAllUserBannedForParentUseCaseCommand)
export class GetAllUserBannedForParentUseCase {
  constructor(
    private parentRepositoryTypeORM: ParentRepositoryTypeORM,
    private blogRepository: BlogRepository,
  ) {}
  async execute(command: GetAllUserBannedForParentUseCaseCommand) {
    const pagination = helper.getBloggerBanListPaginationValues(
      command.paginationBloggerBanListDTO,
    );
    const blog = await this.blogRepository.getBlog(command.parentId);
    if (!blog) {
      throw new NotFoundException(
        'blogId not found,from blogRepository /GetAllUserBannedForParentUseCase',
      );
    }
    if (blog.userId !== command.userId) {
      throw new ForbiddenException(
        'blog ne UpdateBanUserForBlogUseCaseCommand/',
      );
    }
    const userBanned = await this.parentRepositoryTypeORM.getAllUserForParent(
      pagination,
      command.parentId,
    );
    return userBanned;
  }
}
