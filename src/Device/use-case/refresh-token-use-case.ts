import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../deviceRepository';
import { BadRequestException } from '@nestjs/common';
import { DeviceService } from '../deviceService';

export class RefreshTokenUseCaseCommand {
  constructor(
    public refreshToken: string,
    public userId: string,

    public deviceId: string,
  ) {}
}

@CommandHandler(RefreshTokenUseCaseCommand)
export class RefreshTokenUseCase {
  constructor(
    private deviceRepository: DeviceRepository,
    private deviceService: DeviceService,
  ) {}

  async execute(command: RefreshTokenUseCaseCommand) {
    const diesAtDate = await this.deviceService.getDiesAtDate(
      command.refreshToken,
    );
    const lastActiveDate =
      await this.deviceService.getLastActiveDateFromRefreshToken(
        command.refreshToken,
      );
    const updateRefreshTokenDevice =
      await this.deviceRepository.refreshTokenDeviceInBase(
        command.userId,
        command.deviceId,
        lastActiveDate,
        diesAtDate,
      );
    if (!updateRefreshTokenDevice) {
      throw new BadRequestException(
        'refreshTokenDevice no update /deviceService',
      );
    }
    return;
  }
}
