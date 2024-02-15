import { CommandHandler } from '@nestjs/cqrs';

export class SaveFileUseCaseCommand {
  constructor() {}
}
@CommandHandler(SaveFileUseCaseCommand)
export class SaveFileUseCase {
  constructor() {}
  async execute(command: SaveFileUseCaseCommand) {}
}
