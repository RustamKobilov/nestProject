import { CreateUserDto } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { UserService } from '../userService';

export class CreateNewUserForRegistrationUseCaseCommand {
  constructor(public createUserDto: CreateUserDto) {}
}
@CommandHandler(CreateNewUserForRegistrationUseCaseCommand)
export class CreateNewUserForRegistrationUseCase {
  constructor(private userService: UserService) {}

  async execute(
    command: CreateNewUserForRegistrationUseCaseCommand,
  ): Promise<string> {
    const user = await this.userService.createNewUser(
      command.createUserDto,
      false,
    );
    return user.userConfirmationInfo.code;
  }
}
