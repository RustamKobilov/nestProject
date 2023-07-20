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

dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    /*private usersRepository: UserRepository,*/
    private jwtService: JwtService,
    private emailAdapters: EmailAdapters,
    private configService: ConfigService,
  ) {}

  async signIn(login, password) {
    const user = await this.usersService.searchUserLoginAndEmail(login);
    if (!user) {
      throw new UnauthorizedException();
    }
    const resultCompare = await bcriptService.comparePassword(
      password,
      user.password,
    );
    if (!resultCompare) {
      throw new UnauthorizedException();
    }
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
      /*await this.usersRepository.deleteUser(user.id);*/
      throw new BadRequestException(`If email send out`);
    }
    return;
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
