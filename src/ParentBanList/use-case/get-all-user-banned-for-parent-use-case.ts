import { PaginationBloggerBanListDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { helper } from '../../helper';
import { ParentRepositoryTypeORM } from '../parentRepositoryTypeORM';

export class GetAllUserBannedForParentUseCaseCommand {
  constructor(
    public paginationBloggerBanListDTO: PaginationBloggerBanListDTO,
    public parentId: string,
  ) {}
}
@CommandHandler(GetAllUserBannedForParentUseCaseCommand)
export class GetAllUserBannedForParentUseCase {
  constructor(private parentRepositoryTypeORM: ParentRepositoryTypeORM) {}
  async execute(command: GetAllUserBannedForParentUseCaseCommand) {
    const pagination = helper.getBloggerBanListPaginationValues(
      command.paginationBloggerBanListDTO,
    );
    const userBanned = await this.parentRepositoryTypeORM.getAllUserForParent(
      pagination,
      command.parentId,
    );
    return userBanned;
  }
}
