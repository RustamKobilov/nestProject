import { CreateUserDto } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { SaUserViewModel, UserViewModel } from '../../viewModelDTO';
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
  ): Promise<SaUserViewModel> {
    const user = await this.userService.createNewUser(
      command.createUserDto,
      true,
    );
    const userSaViewModel: SaUserViewModel = {
      id: user.id,
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
      banInfo: {
        banReason: null,
        isBanned: false,
        banDate: null,
      },
    };
    return userSaViewModel;
  }
}
