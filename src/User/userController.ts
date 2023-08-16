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
import { CreateUserDto, UserPaginationDTO } from '../DTO';
import { Response } from 'express';
import { SkipThrottle } from '@nestjs/throttler';
@SkipThrottle()
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query() userPagination: UserPaginationDTO) {
    return this.userService.getUsers(userPagination);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUserOutputUserViewModel(createUserDto);
  }

  @Delete('/:id')
  async deleteUser(@Param('id') userId: string, @Res() res: Response) {
    await this.userService.deleteUser(userId);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
