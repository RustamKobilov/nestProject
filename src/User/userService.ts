import { UserRepository } from './userRepository';
import { CreateUserDto, outputModel, UserPaginationDTO } from '../DTO';
import { User } from './User';
import { mapObject } from '../mapObject';
import { bcriptService } from '../bcryptService';
import { addHours } from 'date-fns';
import { randomUUID } from 'crypto';
import { UserViewModel } from '../viewModelDTO';
import { Injectable } from '@nestjs/common';
import { helper } from '../helper';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  private async createNewUser(createUserDto: CreateUserDto): Promise<User> {
    await this.userRepository.checkDuplicateLoginAndEmail(createUserDto);

    const salt = await bcriptService.getSalt(8);
    const hash = await bcriptService.getHashPassword(
      createUserDto.password,
      salt,
    );
    const user: User = {
      id: randomUUID(),
      login: createUserDto.login,
      password: hash,
      salt: salt,
      email: createUserDto.email,
      createdAt: new Date().toISOString(),
      userConfirmationInfo: {
        userConformation: false,
        code: randomUUID(),
        expirationCode: addHours(new Date(), 1).toISOString(),
      },
    };
    await this.userRepository.createUser(user);
    return user;
  }
  async createUserOutputUserViewModel(
    createUserDto: CreateUserDto,
  ): Promise<UserViewModel> {
    const user = await this.createNewUser(createUserDto);
    const outputUserModel = mapObject.mapUserForViewModel(user);
    return outputUserModel;
  }
  async getUsers(
    userPagination: UserPaginationDTO,
  ): Promise<outputModel<User>> {
    const pagination = helper.getUserPaginationValues(userPagination);
    const createFilter = this.userRepository.getFilterGetUsers(pagination);
    return await this.userRepository.getUsers(pagination, createFilter);
  }

  async deleteUser(userId: string) {
    const findUser = await this.userRepository.getUser(userId);
    return await this.userRepository.deleteUser(userId);
  }

  async searchUserLoginAndEmail(login: string): Promise<User> {
    return await this.userRepository.getUserByLoginOrEmail(login);
  }
  async confirmationUser(code: string) {
    return await await this.userRepository.getCodeConfirmationByUserId(code);
  }
  async createNewUserRegistration(
    createUserDto: CreateUserDto,
  ): Promise<string> {
    const user = await this.createNewUser(createUserDto);
    return user.userConfirmationInfo.code;
  }
}
