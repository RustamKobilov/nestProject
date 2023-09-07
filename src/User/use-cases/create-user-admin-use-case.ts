import { CreateUserDto } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { UserViewModel } from '../../viewModelDTO';
import { mapObject } from '../../mapObject';
import { UserService } from '../userService';

export class CreateUserAdminUseCaseCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
@CommandHandler(CreateUserAdminUseCaseCommand)
export class CreateUserAdminUseCase {
  constructor(private userService: UserService) {}

  async execute(
    command: CreateUserAdminUseCaseCommand,
  ): Promise<UserViewModel> {
    const user = await this.userService.createNewUser(
      command.createUserDto,
      true,
    );
    const outputUserModel = mapObject.mapUserForViewModel(user);
    return outputUserModel;
  }
}
