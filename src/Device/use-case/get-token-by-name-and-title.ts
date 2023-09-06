import { CommandHandler } from '@nestjs/cqrs';
import { DeviceRepository } from '../deviceRepository';

export class GetTokenByNameAndTitleCommand {
  constructor(public userId: string, public title: string) {}
}

@CommandHandler(GetTokenByNameAndTitleCommand)
export class GetTokenByNameAndTitle {
  constructor(private deviceRepository: DeviceRepository) {}

  async execute(command: GetTokenByNameAndTitleCommand) {
    return await this.deviceRepository.checkTokenInByUserIdAndTitle(
      command.userId,
      command.title,
    );
  }
}
