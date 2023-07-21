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
import { DeviceRepository } from '../Device/deviceRepository';
import { randomUUID } from 'crypto';

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    /*private usersRepository: UserRepository,*/
    private jwtService: JwtService,
    private emailAdapters: EmailAdapters,
    private configService: ConfigService,
    private deviceRepository: DeviceRepository,
  ) {}

  async signIn(login, password, ip) {
    const user = await this.usersService.searchUserLoginAndEmail(login);
    if (!user) {
      throw new UnauthorizedException();
    }
    const resultCompare = await bcriptService.comparePassword(
      password,
      user.password,
    );
    console.log(ip);
    if (!resultCompare) {
      throw new UnauthorizedException();
    }
    await this.registrationAttempt(ip, user.id);
    return await this.getTokens(user.id);
  }

  // async createToken(userId: string): Promise<string> {
  //   const payload = { userId: userId };
  //   return await this.jwtService.signAsync(payload);
  // }
  async getTokens(userId: string /*username: string*/) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          sub: userId,
          /*username,*/
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRED'),
        },
      ),
      this.jwtService.signAsync(
        {
          sub: userId,
          /*username,*/
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

  async registration(createUserDto: CreateUserDto) {
    const userConfirmationCode =
      await this.usersService.createNewUserRegistration(createUserDto);
    try {
      await this.emailAdapters.gmailSendEmailRegistration(
        createUserDto.email,
        userConfirmationCode,
      );
    } catch (error) {
      console.error('email send out');
      await this.usersService.deleteUserbyConfirmationCode(
        userConfirmationCode,
      );
      throw new BadRequestException(`If email send out`);
    }
    return;
  }

  async registrationAttempt(userId: string, title: string) {
    const device = await this.deviceRepository.checkTokenInBaseByName(
      userId,
      title,
    );
    // if (!device) {
    //   const deviceId = randomUUID();
    //   refreshToken = await this.jwtService.createRefreshToken(
    //     user.id,
    //     deviceId,
    //   );
    //   const lastActiveDate =
    //     await this.jwtService.getLastActiveDateFromRefreshToken(refreshToken);
    //   const diesAtDate = await this.jwtService.getDiesAtDate(refreshToken);
    //   await this.jwtService.createTokenByUserIdInBase(
    //     user.id,
    //     paginationUserInformation,
    //     deviceId,
    //     lastActiveDate,
    //     diesAtDate,
    //   );
    // } else {
    //   refreshToken = await this.jwtService.createRefreshToken(
    //     user.id,
    //     checkTokenInBaseByName,
    //   );
    //   const lastActiveDate =
    //     await this.jwtService.getLastActiveDateFromRefreshToken(refreshToken);
    //   const diesAtDate = await this.jwtService.getDiesAtDate(refreshToken);
    //   await this.jwtService.updateTokenInBase(
    //     user.id,
    //     paginationUserInformation.title,
    //     lastActiveDate,
    //     diesAtDate,
    //   );
    // }

    return true;
  }
}
//   async verifyToken(token: string) {
//     try {
//       console.log(token);
//       const payload = await this.jwtService.verify(token);
//       console.log(payload);
//       return payload;
//     } catch (e) {
//       console.log('errrorrr');
//       return false;
//     }
//     return 'huli';
//   }
// }
//verify work , service adapter
//TODO сделать декод на jonwebtoken смотреть проект express HT
