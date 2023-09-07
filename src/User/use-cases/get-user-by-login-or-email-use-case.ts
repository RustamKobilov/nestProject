import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { UnauthorizedException } from '@nestjs/common';

export class GetUserByLoginOrEmailUseCaseCommand {
  constructor(public login: string) {}
}
@CommandHandler(GetUserByLoginOrEmailUseCaseCommand)
export class GetUserByLoginOrEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(command: GetUserByLoginOrEmailUseCaseCommand) {
    const user = await this.userRepository.getUserByLoginOrEmail(command.login);
    if (!user) {
      throw new UnauthorizedException(
        'loginOrEmail not found user /userService',
      );
    }
    if (user.userConfirmationInfo.userConformation === false) {
      throw new UnauthorizedException('code not confirmation /userService');
    }
    return user;
  }
}
