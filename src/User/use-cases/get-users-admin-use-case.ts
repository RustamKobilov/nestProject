import {
  outputModel,
  UserAdminPaginationDTO,
  UserPaginationDTO,
} from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { UserViewModel } from '../../viewModelDTO';
import { helper } from '../../helper';
import { BanStatusForAdminPagination } from '../../Enum';

export class GetUsersAdminUseCaseCommand {
  constructor(public userPagination: UserAdminPaginationDTO) {}
}
@CommandHandler(GetUsersAdminUseCaseCommand)
export class GetUsersAdminUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    command: GetUsersAdminUseCaseCommand,
  ): Promise<outputModel<UserViewModel>> {
    const pagination = helper.getUserAdminPaginationValues(
      command.userPagination,
    );
    const createFilter = this.userRepository.getFilterGetUsers(pagination);
    const users = await this.userRepository.getUsersForAdmin(
      pagination,
      createFilter,
    );
    return users;
  }
}
