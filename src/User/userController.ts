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

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(@Query() userPagination: UserPaginationDTO) {
    return this.userService.getUsers(userPagination);
  }

  @Post()
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createNewUser(createUserDto);
  }

  @Delete('/:id')
  deleteUser(@Param('id') userId: string, @Res() res: Response) {
    this.userService.deleteUser(userId);
    return res.sendStatus(HttpStatus.NO_CONTENT);
  }
}
