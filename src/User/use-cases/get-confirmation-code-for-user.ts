import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { BadRequestException } from '@nestjs/common';

export class GetConfirmationCodeForUserCommand {
  constructor(public code: string) {}
}
@CommandHandler(GetConfirmationCodeForUserCommand)
export class GetConfirmationCodeForUser {
  constructor(private userRepository: UserRepository) {}

  async execute(command: GetConfirmationCodeForUserCommand) {
    const user = await await this.userRepository.getCodeConfirmationByUserId(
      command.code,
    );
    if (!user) {
      throw new BadRequestException('code not found for user /userService');
    }
    if (user.userConfirmationInfo.userConformation === true) {
      throw new BadRequestException(
        'code  steal, userConformation = true /userService',
      );
    }
    const dateNow = new Date(new Date().getTime());
    const dateCode = new Date(
      new Date(user.userConfirmationInfo.expirationCode).getTime(),
    );
    if (dateCode < dateNow) {
      throw new BadRequestException(
        'code confirmation time expire /userService',
      );
    }
    await this.userRepository.updateConfirmationUserId(user.id);
    return;
  }
}
