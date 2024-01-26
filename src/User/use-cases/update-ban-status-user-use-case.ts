import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { isUUID } from 'class-validator';
import { DeviceRepository } from '../../Device/deviceRepository';
import { UserBanListRepositoryTypeORM } from '../../UserBanList/userBanListRepositoryTypeORM';

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
    private userBanListRepository: UserBanListRepositoryTypeORM,
    private deviceRepository: DeviceRepository,
  ) {}

  async execute(command: UpdateBanStatusForUserCommand) {
    console.log(command.userId);
    if (isUUID(command.userId) === false) {
      throw new BadRequestException(
        'userId not found,from banListRepo not uuid /UpdateBanStatusForUserUseCase',
      );
    }
    const user = await this.userRepository.getUser(command.userId);
    console.log(user);
    if (!user) {
      console.log('tyt padaet  not found User /UpdateBanStatusForUserUseCase');
      throw new BadRequestException(
        `userId not found User /UpdateBanStatusForUserUseCase`,
      );
      return;
    }
    console.log(command.banResult);
    if (!command.banResult) {
      console.log('false');
      const deleteUserForBanList =
        await this.userBanListRepository.deleteUserInBanList(user.id);
      await this.userBanListRepository.updateVisionStatusForParentByUserId(
        user.id,
        true,
      );
    } else {
      console.log('true');
      const addUserForBanList =
        await this.userBanListRepository.addUserInBanList(
          user.id,
          command.banReason,
        );
      await this.deviceRepository.deleteDevicesForUser(user.id);
      await this.userBanListRepository.updateVisionStatusForParentByUserId(
        user.id,
        false,
      );
    }
    return true;
  }
}
