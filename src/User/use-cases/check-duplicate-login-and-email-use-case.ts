import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

export class CheckDublicateLoginAndEmailUseCaseCommand {
  constructor(public login: string, public email: string) {}
}
@CommandHandler(CheckDublicateLoginAndEmailUseCaseCommand)
export class CheckDuplicateLoginAndEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(command: CheckDublicateLoginAndEmailUseCaseCommand) {
    const checkLoginAndEmail =
      await this.userRepository.findUserByLoginAndEmail(
        command.login,
        command.email,
      );
    if (checkLoginAndEmail) {
      throw new BadRequestException('email and login busy');
    }
    return;
  }
}
