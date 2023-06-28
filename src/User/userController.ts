import { UserService } from './userService';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CreateUserDto, UserPaginationDTO } from '../DTO';

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
  deleteUser(@Param('id') userId: string) {
    return this.userService.deleteUser(userId);
  }
}
