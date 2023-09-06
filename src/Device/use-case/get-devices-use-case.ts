import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../deviceRepository';
import { DeviceViewModel } from '../../viewModelDTO';

export class GetDevicesUseCaseCommand {
  constructor(public userId: string) {}
}
@CommandHandler(GetDevicesUseCaseCommand)
export class GetDevicesUseCase {
  constructor(private deviceRepository: DeviceRepository) {}

  async execute(command: GetDevicesUseCaseCommand): Promise<DeviceViewModel[]> {
    return await this.deviceRepository.getDevices(command.userId);
  }
}
