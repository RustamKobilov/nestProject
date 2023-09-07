import { UserRepository } from './userRepository';
import {
  CreateUserDto,
  UpdatePasswordDTO,
  outputModel,
  UserPaginationDTO,
} from '../DTO';
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
  UnauthorizedException,
} from '@nestjs/common';
import { helper } from '../helper';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async createNewUser(
    createUserDto: CreateUserDto,
    adminCreate: boolean,
  ): Promise<User> {
    const checkDublicateUser =
      await this.userRepository.checkDuplicateLoginAndEmail(createUserDto);
    if (!checkDublicateUser) {
      throw new UnauthorizedException(`login and email dublicate /userService`);
    }
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
      recoveryPasswordInfo: {
        recoveryCode: 'registration password',
        diesAtDate: 'registration password',
      },
    };
    if (adminCreate === true) {
      user.userConfirmationInfo.userConformation = true;
    }
    await this.userRepository.createUser(user);
    return user;
  }
  async checkEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('email invalid,not found/userService');
      //throw new NotFoundException('email not found for user /userService');
    }
    return user;
  }
  async deleteUserbyConfirmationCode(userConfirmationCode: string) {
    return this.userRepository.deleteUserByConfirmationCode(
      userConfirmationCode,
    );
  }
  //TODO что делать с таким сервисом
  async passwordRecovery(
    userId: string,
    recoveryCode: string,
    diesAtDate: string,
  ) {
    return await this.userRepository.recoveryPassword(
      userId,
      recoveryCode,
      diesAtDate,
    );
  }

  async getUsersAdmin(userId: string) {
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new NotFoundException(`userId not found /userService`);
    }
    return user;
  }
}
