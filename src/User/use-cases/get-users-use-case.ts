import { outputModel, UserPaginationDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { UserViewModel } from '../../viewModelDTO';
import { helper } from '../../helper';
import { UserRepository } from '../userRepository';

export class GetUsersUseCaseCommand {
  constructor(public userPagination: UserPaginationDTO) {}
}
@CommandHandler(GetUsersUseCaseCommand)
export class GetUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    command: GetUsersUseCaseCommand,
  ): Promise<outputModel<UserViewModel>> {
    const pagination = helper.getUserPaginationValues(command.userPagination);
    const createFilter = this.userRepository.getFilterGetUsers(pagination);
    return await this.userRepository.getUsers(pagination, createFilter);
  }
}
