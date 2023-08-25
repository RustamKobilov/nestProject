import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../User/userService';
import { bcriptService } from '../bcryptService';
import { CreateUserDto, UpdatePasswordDTO } from '../DTO';
import { EmailAdapters } from '../adapters/email-adapters';
import * as dotenv from 'dotenv';
import { randomUUID } from 'crypto';
import { DeviceService } from '../Device/deviceService';
import { JwtServices } from '../application/jwtService';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    /*private usersRepository: UserRepository,*/
    private emailAdapters: EmailAdapters,
    private jwtService: JwtServices,
    private deviceService: DeviceService,
  ) {}

  async signIn(login, password, ip, title) {
    const user = await this.usersService.searchUserByLogin(login);
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
    const resultCheckTokenInBase = await this.deviceService.checkTokenByDevice(
      userId,
      deviceId,
      lastActiveDate,
    );
    if (!resultCheckTokenInBase) {
      throw new UnauthorizedException(
        'refreshtoken ykrali, ispolzavali starye /authService ',
      );
    }
    return true;
  }

  async registration(createUserDto: CreateUserDto) {
    const checkLoginAndEmail = await this.usersService.checkLoginAndEmail(
      createUserDto.login,
      createUserDto.email,
    );
    const userConfirmationCode =
      await this.usersService.createNewUserRegistration(createUserDto);
    console.log(userConfirmationCode);
    try {
      await this.emailAdapters.gmailSendEmailRegistration(
        createUserDto.email,
        userConfirmationCode,
      );
    } catch (error) {
      console.log(error);
      console.error('email send out');
      await this.usersService.deleteUserbyConfirmationCode(
        userConfirmationCode,
      );
      console.log('oshibka tyt');
      return false;
    }
    console.log('good job');
    return true;
  }

  async registrationAttempt(userId: string, ip: string, title: string) {
    let refreshToken;
    const device = await this.deviceService.checkTokenByNameAndTitle(
      userId,
      title,
    );
    if (!device) {
      const deviceId = randomUUID();
      refreshToken = await this.jwtService.getRefreshToken(userId, deviceId);
      await this.deviceService.addDevice(
        refreshToken,
        userId,
        title,
        ip,
        deviceId,
      );
    } else {
      console.log('else');
      console.log(device);
      refreshToken = await this.jwtService.getRefreshToken(
        userId,
        device.deviceId,
      );
      await this.deviceService.updateDevice(refreshToken, userId, title);
    }

    return refreshToken;
  }
  async deleteAdminDevice() {
    return await this.deviceService.deleteAdmin();
  }

  async refreshTokenDevice(
    refreshToken: string,
    userId: string,
    deviceId: string,
  ) {
    return await this.deviceService.refreshTokenDevice(
      refreshToken,
      userId,
      deviceId,
    );
  }
  async confirmationUserAfterRegistration(code: string) {
    await this.usersService.confirmationUser(code);
  }
  async updateConfirmationCodeRepeat(email: string) {
    const user = await this.usersService.checkEmail(email);
    const code =
      await this.usersService.updateUserConfirmationCodeRepeatForEmail(user.id);
    try {
      await this.emailAdapters.gmailSendEmailRegistration(email, code);
    } catch (error) {
      console.error('email send out /authService/updateConfirmationCodeRepeat');
      await this.usersService.deleteUserbyConfirmationCode(code);
      throw new BadRequestException(
        'email send out /authService/updateConfirmationCodeRepeat',
      );
    }
    return;
  }
  async getUserInformation(id: string) {
    return await this.usersService.getUserInformation(id);
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
    try {
      await this.emailAdapters.gmailSendEmailPasswordRecovery(
        email,
        recoveryCode,
      );
    } catch (error) {
      console.error('email send out');
      return false;
    }
  }
  //__________ADMIN____________________
  async getDeviceAdmin(deviceId: string) {
    return await this.deviceService.getDeviceAdminById(deviceId);
  }

  async updatePasswordUserAuthService(newPasswordBody: UpdatePasswordDTO) {
    await this.usersService.updatePasswordUserUserService(newPasswordBody);
  }

  async getUserAdmin(userId: string) {
    return await this.usersService.getUsersAdmin(userId);
  }
}
//verify work , service adapter
