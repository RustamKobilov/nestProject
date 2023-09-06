import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../deviceRepository';
import { NotFoundException } from '@nestjs/common';

export class GetDeviceUseCaseCommand {
  constructor(public deviceId: string) {}
}

@CommandHandler(GetDeviceUseCaseCommand)
export class GetDeviceUseCase {
  constructor(private deviceRepository: DeviceRepository) {}

  async execute(command: GetDeviceUseCaseCommand) {
    const device = await this.deviceRepository.getDevice(command.deviceId);
    if (!device) {
      throw new NotFoundException(
        'deviceId not found for device /deviceService',
      );
    }
    return device;
  }
}
