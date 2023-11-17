import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { CreateUserDto, UserPaginationDTO } from '../DTO';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
import { BasicAuthorizationGuard } from '../auth/Guard/basicAuthorizationGuard';
import { CommandBus } from '@nestjs/cqrs';
import { CreateUserAdminUseCaseCommand } from './use-cases/create-user-admin-use-case';
import { GetUsersUseCaseCommand } from './use-cases/get-users-use-case';
import { DeleteUserUseCaseCommand } from './use-cases/delete-user-use-case';

@SkipThrottle()
@Controller('sa/users')
export class UserController {
  constructor(private commandBus: CommandBus) {}
  @UseGuards(BasicAuthorizationGuard)
  @Get()
  getUsers(@Query() userPagination: UserPaginationDTO) {
    return this.commandBus.execute(new GetUsersUseCaseCommand(userPagination));
  }
  @UseGuards(BasicAuthorizationGuard)
  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.commandBus.execute(
      new CreateUserAdminUseCaseCommand(createUserDto),
    );
  }
  @UseGuards(BasicAuthorizationGuard)
  @Delete('/:id')
  async deleteUser(@Param('id') userId: string, @Res() res: Response) {
    await this.commandBus.execute(new DeleteUserUseCaseCommand(userId));
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
