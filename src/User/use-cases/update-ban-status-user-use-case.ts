import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { fa } from '@faker-js/faker';

export class UpdateBanStatusForUserCommand {
  constructor(
    public userId: string,
    public banResult: boolean,
    public banReason: string,
  ) {}
}
@CommandHandler(UpdateBanStatusForUserCommand)
export class UpdateBanStatusForUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(command: UpdateBanStatusForUserCommand) {
    if (isUUID(command.userId) === false) {
      throw new NotFoundException(
        'userId not found,from banListRepo not uuid /userService',
      );
    }
    const user = await this.userRepository.getUser(command.userId);
    console.log(user);
    if (!user) {
      return;
      throw new NotFoundException(`userId not found /userService`);
    }
    console.log(command.banResult);
    if (!command.banResult) {
      console.log('false');
      const deleteUserForBanList =
        await this.userRepository.deleteUserForBanList(command.userId);
      if (!deleteUserForBanList) {
        throw new NotFoundException(
          `userId not found,from banListRepo /userService`,
        );
      }
    } else {
      console.log('true');
      const addUserForBanList = await this.userRepository.createUserForBanList(
        command.userId,
        command.banReason,
      );
    }
    return true;
  }
}
