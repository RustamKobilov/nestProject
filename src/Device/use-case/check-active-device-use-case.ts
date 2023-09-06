import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../deviceRepository';

export class CheckActiveDeviceUseCaseCommand {
  constructor(
    public userId: string,

    public deviceId: string,
    public lastActiveDate: string,
  ) {}
}

@CommandHandler(CheckActiveDeviceUseCaseCommand)
export class CheckActiveDeviceUseCase {
  constructor(private deviceRepository: DeviceRepository) {}

  async execute(command: CheckActiveDeviceUseCaseCommand) {
    return await this.deviceRepository.checkTokenByDeviceInBase(
      command.userId,
      command.deviceId,
      command.lastActiveDate,
    );
  }
}
