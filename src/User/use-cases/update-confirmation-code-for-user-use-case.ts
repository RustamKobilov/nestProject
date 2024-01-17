import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { addHours } from 'date-fns';

export class UpdateConfirmationCodeForUserCommand {
  constructor(public id: string) {}
}
@CommandHandler(UpdateConfirmationCodeForUserCommand)
export class UpdateConfirmationCodeForUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(command: UpdateConfirmationCodeForUserCommand) {
    const newCode = randomUUID();
    const expirationCode = addHours(new Date(), 1).toISOString();
    const resultUpdateCode =
      await this.userRepository.updateUserConformationCode(
        command.id,
        newCode,
        expirationCode,
      );
    if (!resultUpdateCode) {
      throw new NotFoundException('code not update /userService');
    }
    return newCode;
  }
}
