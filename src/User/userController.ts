import { UserService } from './userService';
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
} from '@nestjs/common';
import { CreateUserDtoAdmin, UserPaginationDTO } from '../DTO';
import { Response } from 'express';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query() userPagination: UserPaginationDTO) {
    return this.userService.getUsers(userPagination);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDtoAdmin) {
    return this.userService.createNewUserAdmin(createUserDto);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') userId: string, @Res() res: Response) {
    await this.userService.deleteUser(userId);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
