import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../deviceRepository';
import { DeviceService } from '../deviceService';
import { BadRequestException } from '@nestjs/common';

export class UpdateDeviceUseCaseCommand {
  constructor(
    public refreshToken: string,
    public userId: string,
    public title: string,
  ) {}
}
@CommandHandler(UpdateDeviceUseCaseCommand)
export class UpdateDeviceUseCase {
  constructor(
    private deviceRepository: DeviceRepository,
    private devicesService: DeviceService,
  ) {}

  async execute(command: UpdateDeviceUseCaseCommand) {
    const lastActiveDate =
      await this.devicesService.getLastActiveDateFromRefreshToken(
        command.refreshToken,
      );
    const diesAtDate = await this.devicesService.getDiesAtDate(
      command.refreshToken,
    );
    const deviceUpdate =
      await this.deviceRepository.updateExpiredTimeTokenInBaseByDevice(
        command.userId,
        command.title,
        lastActiveDate,
        diesAtDate,
      );
    if (!deviceUpdate) {
      throw new BadRequestException('deviceId no update /deviceService');
    }
    return;
  }
}
