import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';

export class UpdateConfirmationCodeForUserCommand {
  constructor(public id: string) {}
}
@CommandHandler(UpdateConfirmationCodeForUserCommand)
export class UpdateConfirmationCodeForUser {
  constructor(private userRepository: UserRepository) {}

  async execute(command: UpdateConfirmationCodeForUserCommand) {
    const newCode = randomUUID();
    const resultUpdateCode =
      await this.userRepository.updateUserConformationCode(command.id, newCode);
    if (!resultUpdateCode) {
      throw new NotFoundException('code not update /userService');
    }
    return newCode;
  }
}
