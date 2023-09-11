import { UpdatePasswordDTO } from '../../DTO';
import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { bcriptService } from '../../bcryptService';
import { NotFoundException } from '@nestjs/common';

export class UpdatePasswordUserUseCaseCommand {
  constructor(public newPasswordBody: UpdatePasswordDTO) {}
}
@CommandHandler(UpdatePasswordUserUseCaseCommand)
export class UpdatePasswordUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(command: UpdatePasswordUserUseCaseCommand) {
    const hash = await bcriptService.getHashPassword(
      command.newPasswordBody.newPassword,
    );
    const resultUpdate =
      await this.userRepository.updatePasswordUserByRecoveryCode(
        command.newPasswordBody.recoveryCode,
        hash,
      );
    if (!resultUpdate) {
      throw new NotFoundException(
        'recoverycode not found, expired recoverycode /userService',
      );
    }
    return;
  }
}
