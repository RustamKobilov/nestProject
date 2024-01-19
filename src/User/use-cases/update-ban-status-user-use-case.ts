import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { DeviceRepository } from '../../Device/deviceRepository';

export class UpdateBanStatusForUserCommand {
  constructor(
    public userId: string,
    public banResult: boolean,
    public banReason: string,
  ) {}
}
@CommandHandler(UpdateBanStatusForUserCommand)
export class UpdateBanStatusForUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private deviceRepository: DeviceRepository,
  ) {}

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
        await this.userRepository.deleteUserForBanList(user.id);
      if (!deleteUserForBanList) {
        throw new NotFoundException(
          `userId not found,from banListRepo /userService`,
        );
      }
    } else {
      console.log('true');
      const addUserForBanList = await this.userRepository.createUserForBanList(
        user.id,
        command.banReason,
      );
      await this.deviceRepository.deleteDevicesForUser(user.id);
    }
    return true;
  }
}
