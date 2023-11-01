import { SkipThrottle } from '@nestjs/throttler';
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
import { CommandBus } from '@nestjs/cqrs';
import { BasicAuthorizationGuard } from '../auth/Guard/basicAuthorizationGuard';
import { CreateUserDto, UserPaginationDTO } from '../DTO';
import { GetUsersUseCaseCommand } from '../User/use-cases/get-users-use-case';
import { CreateUserAdminUseCaseCommand } from '../User/use-cases/create-user-admin-use-case';
import { Response } from 'express';
import { DeleteUserUseCaseCommand } from '../User/use-cases/delete-user-use-case';

@SkipThrottle()
@Controller('/sa/users')
export class AdminController {
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
