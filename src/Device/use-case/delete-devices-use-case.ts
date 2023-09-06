import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../deviceRepository';

export class DeleteDevicesUseCaseCommand {
  constructor(public userId: string, public deviceId: string) {}
}
@CommandHandler(DeleteDevicesUseCaseCommand)
export class DeleteDevicesUseCase {
  constructor(private deviceRepository: DeviceRepository) {}

  async execute(command: DeleteDevicesUseCaseCommand) {
    return await this.deviceRepository.deleteDevicesExceptForHim(
      command.deviceId,
      command.userId,
    );
  }
}
