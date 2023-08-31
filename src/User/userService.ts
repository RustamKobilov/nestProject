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

  private async createNewUser(
    createUserDto: CreateUserDto,
    adminCreate: boolean,
  ): Promise<User> {
    const checkDublicateUser =
      await this.userRepository.checkDuplicateLoginAndEmail(createUserDto);
    if (!checkDublicateUser) {
      throw new UnauthorizedException(`login and email dublicate /userService`);
      //throw new BadRequestException(`login and email dublicate /userService`);
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
  async createUserOutputUserViewModel(
    createUserDto: CreateUserDto,
  ): Promise<UserViewModel> {
    const user = await this.createNewUser(createUserDto, true);
    const outputUserModel = mapObject.mapUserForViewModel(user);
    return outputUserModel;
  }
  async getUsers(
    userPagination: UserPaginationDTO,
  ): Promise<outputModel<UserViewModel>> {
    const pagination = helper.getUserPaginationValues(userPagination);
    const createFilter = this.userRepository.getFilterGetUsers(pagination);
    return await this.userRepository.getUsers(pagination, createFilter);
  }

  async deleteUser(userId: string) {
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new NotFoundException(`userId not found /userService`);
    }
    return await this.userRepository.deleteUser(userId);
  }

  async searchUserByLogin(login: string): Promise<User> {
    const user = await this.userRepository.getUserByLoginOrEmail(login);
    if (!user) {
      throw new UnauthorizedException(
        'loginOrEmail not found user /userService',
      );
    }
    if (user.userConfirmationInfo.userConformation === false) {
      throw new UnauthorizedException('code not confirmation /userService');
      //throw new BadRequestException('code not confirmation /userService');
    }
    return user;
  }
  async confirmationUser(code: string) {
    const user = await await this.userRepository.getCodeConfirmationByUserId(
      code,
    );
    if (!user) {
      throw new BadRequestException('code not found for user /userService');
    }
    if (user.userConfirmationInfo.userConformation === true) {
      throw new BadRequestException(
        'code  steal, userConformation = true /userService',
      );
    }
    const dateNow = new Date(new Date().getTime());
    const dateCode = new Date(
      new Date(user.userConfirmationInfo.expirationCode).getTime(),
    );
    if (dateCode < dateNow) {
      throw new BadRequestException(
        'code confirmation time expire /userService',
      );
    }
    await this.userRepository.updateCodeConfirmationByUserId(user.id);
    return;
  }
  async createNewUserRegistration(
    createUserDto: CreateUserDto,
  ): Promise<string> {
    const user = await this.createNewUser(createUserDto, false);
    return user.userConfirmationInfo.code;
  }

  async deleteUserbyConfirmationCode(userConfirmationCode: string) {
    return this.userRepository.deleteUserByConfirmationCode(
      userConfirmationCode,
    );
  }

  async getUserInformation(userId: string): Promise<MeViewModel> {
    console.log(userId);
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new NotFoundException('userId user not found /userService');
    }
    const outputMeModelUserInformation = mapObject.mapMeUserInformation(user);
    return outputMeModelUserInformation;
  }

  async checkEmail(email: string) {
    const user = await this.userRepository.findUserByEmail(email);
    if (!user) {
      throw new BadRequestException('email invalid,not found/userService');
      //throw new NotFoundException('email not found for user /userService');
    }
    return user;
  }

  async checkLoginAndEmail(login: string, email: string) {
    const checkLoginAndEmail =
      await this.userRepository.findUserByLoginAndEmail(login, email);
    if (checkLoginAndEmail) {
      throw new BadRequestException('email and login busy');
    }
    return;
  }

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

  async updatePasswordUserUserService(newPasswordBody: UpdatePasswordDTO) {
    const salt = await bcriptService.getSalt(8);
    const hash = await bcriptService.getHashPassword(
      newPasswordBody.newPassword,
      salt,
    );
    const resultUpdate =
      await this.userRepository.updatePasswordUserByRecoveryCode(
        newPasswordBody.recoveryCode,
        hash,
      );
    if (!resultUpdate) {
      throw new NotFoundException(
        'recoverycode not found, expired recoverycode /userService',
      );
    }
    return;
  }

  async getUsersAdmin(userId: string) {
    const user = await this.userRepository.getUser(userId);
    if (!user) {
      throw new NotFoundException(`userId not found /userService`);
    }
    return user;
  }

  async updateUserConfirmationCodeRepeatForEmail(id: string): Promise<string> {
    const newCode = randomUUID();
    const resultUpdateCode =
      await this.userRepository.updateUserConformationCode(id, newCode);
    if (!resultUpdateCode) {
      throw new NotFoundException('code not update /userService');
    }
    return newCode;
  }
}
