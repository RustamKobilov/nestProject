import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { NotFoundException } from '@nestjs/common';

export class DeleteUserUseCaseCommand {
  constructor(public userId: string) {}
}
@CommandHandler(DeleteUserUseCaseCommand)
export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(command: DeleteUserUseCaseCommand) {
    const user = await this.userRepository.getUser(command.userId);
    if (!user) {
      throw new NotFoundException(`userId not found /userService`);
    }
    return await this.userRepository.deleteUser(command.userId);
  }
}
