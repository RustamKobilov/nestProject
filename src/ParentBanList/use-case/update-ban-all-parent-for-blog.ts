import { CommandHandler } from '@nestjs/cqrs';
import { ParentRepositoryTypeORM } from '../parentRepositoryTypeORM';
import { ParentBanListEntity } from '../ParentBanList.Entity';
import { UpdateBanStatusUserForBlogDTO } from '../../DTO';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../User/userRepository';
import { BlogRepository } from '../../Blog/blogRepository';

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
    private userRepositoryTypeORM: UserRepository,
    private blogRepository: BlogRepository,
  ) {}

  async execute(command: UpdateBanUserForBlogUseCaseCommand) {
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
    const userBanned = await this.userRepositoryTypeORM.getUser(command.userId);
    if (!userBanned) {
      throw new BadRequestException(
        'userId not found,from userRepository /updateBanUserForBlogUseCase',
      );
    }
    if (command.updateBanStatusUserForBlogDTO.isBanned === true) {
      const checkUserParentBanList =
        await this.parentRepositoryTypeORM.findUserInParentBanList(
          command.updateBanStatusUserForBlogDTO.blogId,
          userBanned.id,
        );
      if (checkUserParentBanList) {
        return;
      }
      const parentBanListEntity: ParentBanListEntity = {
        userId: userBanned.id,
        userLogin: userBanned.login,
        banReason: command.updateBanStatusUserForBlogDTO.banReason,
        createdAt: new Date().toISOString(),
        parentId: command.updateBanStatusUserForBlogDTO.blogId,
      };
      await this.parentRepositoryTypeORM.addParentBanList(parentBanListEntity);
    } else {
      await this.parentRepositoryTypeORM.deleteUserInParentBanList(
        command.ownerId,
        userBanned.id,
      );
    }
    return;
  }
}
