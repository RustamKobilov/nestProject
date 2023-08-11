import { UserRepository } from './userRepository';
import { CreateUserDto, outputModel, UserPaginationDTO } from '../DTO';
import { User } from './User';
import { mapObject } from '../mapObject';
import { bcriptService } from '../bcryptService';
import { addHours } from 'date-fns';
import { randomUUID } from 'crypto';
import { MeViewModel, UserViewModel } from '../viewModelDTO';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new NotFoundException(`If specified user is not exists`);
    }
    return await this.userRepository.deleteUser(userId);
  }

  async searchUserLoginAndEmail(login: string): Promise<User> {
    const user = await this.userRepository.getUserByLoginOrEmail(login);
    if (user.userConfirmationInfo.userConformation === false) {
      throw new BadRequestException('confirmation false');
    }
    return user;
  }
  async confirmationUser(code: string) {
    const user = await await this.userRepository.getCodeConfirmationByUserId(
      code,
    );
    if (user.userConfirmationInfo.userConformation === true) {
      throw new BadRequestException('user not found by cod');
    }
    const dateNow = new Date(new Date().getTime());
    const dateCode = new Date(
      new Date(user.userConfirmationInfo.expirationCode).getTime(),
    );
    if (dateCode < dateNow) {
      throw new BadRequestException('user confirmation time expire');
    }
    await this.userRepository.updateCodeConfirmationByUserId(user.id);
    return;
  }
  async createNewUserRegistration(
    createUserDto: CreateUserDto,
  ): Promise<string> {
    const user = await this.createNewUser(createUserDto);
    return user.userConfirmationInfo.code;
  }

  async deleteUserbyConfirmationCode(userConfirmationCode: string) {
    return this.userRepository.deleteUserByConfirmationCode(
      userConfirmationCode,
    );
  }

  async getUserInformation(userId: string): Promise<MeViewModel> {
    const user = await this.userRepository.getUser(userId);
    console.log('service');
    console.log(user);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    const outputMeModelUserInformation = mapObject.mapMeUserInformation(user);
    return outputMeModelUserInformation;
  }
}
