import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../User/userService';
import { bcriptService } from '../bcryptService';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../DTO';
import { EmailAdapters } from '../adapters/email-adapters';
import * as dotenv from 'dotenv';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';
import { DeviceService } from '../Device/deviceService';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    /*private usersRepository: UserRepository,*/
    private jwtService: JwtService,
    private emailAdapters: EmailAdapters,
    private configService: ConfigService,
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
    // const refreshToken = await this.registrationAttempt(ip, user.id, title);
    // const accessToken = await this.getAccessToken(user.id)
    return {
      accessToken: await this.getAccessToken(user.id),
      refreshToken: await this.registrationAttempt(user.id, ip, title),
    };
  }
  async getAccessToken(userId: string) {
    return await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRED'),
      },
    );
  }
  async getRefreshToken(userId: string, deviceId: string) {
    return await this.jwtService.signAsync(
      { userId, deviceId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRED'),
      },
    );
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
    console.log('est vnutri raz');
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
      refreshToken = await this.getRefreshToken(userId, deviceId);
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
      refreshToken = await this.getRefreshToken(userId, device.deviceId);
      await this.deviceService.updateDevice(refreshToken, userId, title);
    }

    return refreshToken;
  }
  async getTokens(userId: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRED'),
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          deviceId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRED'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
  async deleteAdminDevice() {
    return await this.deviceService.deleteAdmin();
  }
  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token);
      console.log(payload);
      return payload;
    } catch (e) {
      console.log(e);
      return false;
    }
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

  async getDeviceAdmin(deviceId: string) {
    return await this.deviceService.getDeviceAdminById(deviceId);
  }

  async deleteDeviceInLogout(userId: string, deviceId: string) {
    return await this.deviceService.deleteDevice(userId, deviceId);
  }
}
//verify work , service adapter
//TODO сделать декод на jonwebtoken смотреть проект express HT
