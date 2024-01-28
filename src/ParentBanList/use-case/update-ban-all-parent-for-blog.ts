import { CommandHandler } from '@nestjs/cqrs';
import { ParentRepositoryTypeORM } from '../parentRepositoryTypeORM';
import { ParentBanListEntity } from '../ParentBanList.Entity';
import { UpdateBanStatusUserForBlogDTO } from '../../DTO';
import { BlogsRepositoryTypeORM } from '../../Blog/blogsRepositoryTypeORM';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class UpdateBanUserForBlogUseCaseCommand {
  constructor(
    public ownerId: string,
    public userId: string,
    public updateBanStatusUserForBlogDTO: UpdateBanStatusUserForBlogDTO,
  ) {}
}
@CommandHandler(UpdateBanUserForBlogUseCaseCommand)
export class updateBanUserForBlogUseCase {
  constructor(
    private parentRepositoryTypeORM: ParentRepositoryTypeORM,
    private blogRepository: BlogsRepositoryTypeORM,
  ) {}

  async execute(command: UpdateBanUserForBlogUseCaseCommand) {
    //"isBanned": true,
    //   "banReason": "stringstringstringst",
    //   "blogId": "string"
    const blog = await this.blogRepository.getBlog(
      command.updateBanStatusUserForBlogDTO.blogId,
    );
    if (!blog) {
      throw new BadRequestException(
        'blogId not found,from blogRepository /updateBanUserForBlogUseCase',
      );
    }
    if (blog.userId !== command.ownerId) {
      throw new UnauthorizedException(
        'blog ne UpdateBanUserForBlogUseCaseCommand/',
      );
    }

    // const parentBanListEntity: ParentBanListEntity = {
    //   userId: command.userId,
    //   userLogin: command.userLogin,
    //   banReason: command.banReason,
    //   createdAt: new Date().toISOString(),
    //   ownerId: command.ownerId,
    // };
    // await this.parentRepositoryTypeORM.addParentBanList(parentBanListEntity);
    return;
  }
}
