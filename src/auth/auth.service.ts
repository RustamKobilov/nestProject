import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../User/userService';
import { bcriptService } from '../bcryptService';
import { CreateUserDto } from '../DTO';
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
    const user = await this.usersService.searchUserLoginAndEmail(login);
    if (!user) {
      throw new UnauthorizedException();
    }
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
        'refreshtoken ykrali, ispolzavali starye',
      );
    }
    return true;
  }

  async registration(createUserDto: CreateUserDto) {
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
      throw new BadRequestException(`If email send out`);
    }
    return;
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
  async getUserInformation(id: string) {
    await this.usersService.getUserInformation(id);
  }
  async deleteDeviceInLogout(deviceId: string) {
    return await this.deviceService.deleteDevice(deviceId);
  }
  //__________ADMIN____________________
  async getDeviceAdmin(deviceId: string) {
    return await this.deviceService.getDeviceAdminById(deviceId);
  }
}
//verify work , service adapter
//TODO сделать декод на jonwebtoken смотреть проект express HT
