import { CommandHandler } from '@nestjs/cqrs';
import { DeviceService } from '../deviceService';
import { DeviceRepository } from '../deviceRepository';
import { Device } from '../Device';

export class CreateDeviceUseCaseCommand {
  constructor(
    public refreshToken: string,
    public userId: string,
    public title: string,
    public ip: string,
    public deviceId: string,
  ) {}
}
@CommandHandler(CreateDeviceUseCaseCommand)
export class CreateDeviceUseCase {
  constructor(
    private deviceRepository: DeviceRepository,
    private devicesService: DeviceService,
  ) {}

  async execute(command: CreateDeviceUseCaseCommand) {
    const lastActiveDate =
      await this.devicesService.getLastActiveDateFromRefreshToken(
        command.refreshToken,
      );
    const diesAtDate = await this.devicesService.getDiesAtDate(
      command.refreshToken,
    );
    const device: Device = {
      userId: command.userId,
      title: command.title,
      ip: command.ip,
      deviceId: command.deviceId,
      lastActiveDate: lastActiveDate,
      diesAtDate: diesAtDate,
    };
    await this.deviceRepository.createTokenByUserIdInBase(device);
  }
}
