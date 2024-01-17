import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../User/userService';
import { bcriptService } from '../bcryptService';
import { CreateUserDto, UpdatePasswordDTO } from '../DTO';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { DeviceService } from '../Device/deviceService';
import { JwtServices } from '../application/jwtService';
import { CommandBus } from '@nestjs/cqrs';
import { CreateDeviceUseCaseCommand } from '../Device/use-case/create-device-use-case';
import { UpdateDeviceUseCaseCommand } from '../Device/use-case/update-device-use-case';
import { GetTokenByNameAndTitleCommand } from '../Device/use-case/get-token-by-name-and-title';
import { CheckActiveDeviceUseCaseCommand } from '../Device/use-case/check-active-device-use-case';
import { RefreshTokenUseCaseCommand } from '../Device/use-case/refresh-token-use-case';
import { SendEmailForRegistrationUserUseCaseCommand } from '../adapters/email-adapters/use-case/send-email-for-registration-user-use-case';
import { SendEmailForPasswordRecoveryUseCaseCommand } from '../adapters/email-adapters/use-case/send-email-for-password-recovery-use-case';
import { GetUserByLoginOrEmailUseCaseCommand } from '../User/use-cases/get-user-by-login-or-email-use-case';
import { CreateNewUserForRegistrationUseCaseCommand } from '../User/use-cases/create-new-user-for-registration-use-case';
import { CheckDublicateLoginAndEmailUseCaseCommand } from '../User/use-cases/check-duplicate-login-and-email-use-case';
import { UpdateConfirmationCodeForUserCommand } from '../User/use-cases/update-confirmation-code-for-user-use-case';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtServices,
    private deviceService: DeviceService,
    private commandBus: CommandBus,
  ) {}

  async signIn(login, password, ip, title) {
    const user = await this.commandBus.execute(
      new GetUserByLoginOrEmailUseCaseCommand(login),
    );
    const resultCompare = await bcriptService.comparePassword(
      password,
      user.password,
    );
    console.log(ip);
    console.log(title);
    if (!resultCompare) {
      throw new UnauthorizedException();
    }
    return {
      accessToken: await this.jwtService.getAccessToken(user.id),
      refreshToken: await this.registrationAttempt(user.id, ip, title),
    };
  }
  async checkRefreshTokenForUser(
    refreshToken: string,
    userId: string,
    deviceId: string,
  ) {
    const lastActiveDate =
      await this.deviceService.getLastActiveDateFromRefreshToken(refreshToken);
    const resultCheckTokenInBase = await this.commandBus.execute(
      new CheckActiveDeviceUseCaseCommand(userId, deviceId, lastActiveDate),
    );
    if (!resultCheckTokenInBase) {
      throw new UnauthorizedException(
        'refreshtoken ykrali, ispolzavali starye /authService ',
      );
    }
    return true;
  }

  async registration(createUserDto: CreateUserDto) {
    const checkLoginAndEmail = await this.commandBus.execute(
      new CheckDublicateLoginAndEmailUseCaseCommand(
        createUserDto.login,
        createUserDto.email,
      ),
    ); // проверка есть в декораторе ggg
    const userConfirmationCode = await this.commandBus.execute(
      new CreateNewUserForRegistrationUseCaseCommand(createUserDto),
    );
    console.log(userConfirmationCode);
    try {
      await this.commandBus.execute(
        new SendEmailForRegistrationUserUseCaseCommand(
          createUserDto.email,
          userConfirmationCode,
        ),
      );
      console.log(
        'SEND EMAIL ' + createUserDto.email + ' code ' + userConfirmationCode,
      );
    } catch (error) {
      console.error('email send out');
      await this.usersService.deleteUserbyConfirmationCode(
        userConfirmationCode,
      );
      return false;
    }
    return true;
  }

  async registrationAttempt(userId: string, ip: string, title: string) {
    let refreshToken;
    const device = await this.commandBus.execute(
      new GetTokenByNameAndTitleCommand(userId, title),
    );
    if (!device) {
      const deviceId = randomUUID();
      refreshToken = await this.jwtService.getRefreshToken(userId, deviceId);
      await this.commandBus.execute(
        new CreateDeviceUseCaseCommand(
          refreshToken,
          userId,
          title,
          ip,
          deviceId,
        ),
      );
    } else {
      console.log('device est v base');
      console.log(device);
      refreshToken = await this.jwtService.getRefreshToken(
        userId,
        device.deviceId,
      );
      await this.commandBus.execute(
        new UpdateDeviceUseCaseCommand(refreshToken, userId, title),
      );
    }

    return refreshToken;
  }
  async refreshTokenDevice(
    refreshToken: string,
    userId: string,
    deviceId: string,
  ) {
    return await this.commandBus.execute(
      new RefreshTokenUseCaseCommand(refreshToken, userId, deviceId),
    );
  }
  async updateConfirmationCodeRepeat(email: string) {
    const user = await this.usersService.checkEmail(email);
    if (user.userConfirmationInfo.userConformation == true) {
      throw new BadRequestException('email confirmed /authService');
    }
    const code = await this.commandBus.execute(
      new UpdateConfirmationCodeForUserCommand(user.id),
    );
    try {
      await this.commandBus.execute(
        new SendEmailForRegistrationUserUseCaseCommand(email, code),
      );
      console.log('SEND EMAIL ' + email + ' code ' + code);
    } catch (error) {
      console.error('email send out /authService/updateConfirmationCodeRepeat');
      await this.usersService.deleteUserbyConfirmationCode(code);
      throw new BadRequestException(
        'email send out /authService/updateConfirmationCodeRepeat',
      );
    }
    return;
  }
  async deleteDeviceInLogout(deviceId: string) {
    return await this.deviceService.deleteDevice(deviceId);
  }
  async recoveryPassword(email: string) {
    const recoveryCode = randomUUID();
    const expiredRecoveryCode = 30000;
    const diesAtDate = new Date(Date.now() + expiredRecoveryCode).toISOString();
    const user = await this.usersService.checkEmail(email);
    await this.usersService.passwordRecovery(user.id, recoveryCode, diesAtDate);
    console.log('SEND EMAIL ' + email + ' code ' + recoveryCode);
    try {
      await this.commandBus.execute(
        new SendEmailForPasswordRecoveryUseCaseCommand(email, recoveryCode),
      );
      return true;
    } catch (error) {
      console.error('email send out');
      return false;
    }
  }
  //______________________________________ADMIN______________
  async getUserAdmin(userId: string) {
    return await this.usersService.getUsersAdmin(userId);
  }
}
