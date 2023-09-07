import { CommandHandler } from '@nestjs/cqrs';
import { UserRepository } from '../userRepository';
import { MeViewModel } from '../../viewModelDTO';
import { NotFoundException } from '@nestjs/common';
import { mapObject } from '../../mapObject';

export class GetUserInformationUseCaseCommand {
  constructor(public userId: string) {}
}
@CommandHandler(GetUserInformationUseCaseCommand)
export class GetUserInformationUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(
    command: GetUserInformationUseCaseCommand,
  ): Promise<MeViewModel> {
    const user = await this.userRepository.getUser(command.userId);
    if (!user) {
      throw new NotFoundException('userId user not found /userService');
    }
    const outputMeModelUserInformation = mapObject.mapMeUserInformation(user);
    return outputMeModelUserInformation;
  }
}
