import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../User/userService';
import { bcriptService } from '../bcryptService';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { token } from '../Enum';
import { CreateUserDto } from '../DTO';
import { EmailAdapters } from '../adapters/email-adapters';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    /*private usersRepository: UserRepository,*/
    private jwtService: JwtService,
    private emailAdapters: EmailAdapters,
  ) {}

  async signIn(login, password) {
    const user = await this.usersService.searchUserLoginAndEmail(login);
    if (!user) {
      throw new UnauthorizedException();
    }
    console.log('1');
    const resultCompare = await bcriptService.comparePassword(
      password,
      user.password,
    );
    if (!resultCompare) {
      return false;
    }
    //if(user.userConfirmationInfo.userConformation==false){return false}

    console.log('2');

    return {
      [token.refreshToken]: await this.createToken(user.id),
    };
  }
  async createToken(userId: string): Promise<string> {
    const payload = { userId: userId };
    return await this.jwtService.signAsync(payload);
  }
  async registration(createUserDto: CreateUserDto) {
    const userConfirmationCode =
      await this.usersService.createNewUserRegistration(createUserDto);
    const code = await this.createToken(userConfirmationCode);
    try {
      await this.emailAdapters.gmailSendEmailRegistration(
        createUserDto.email,
        code,
      );
    } catch (error) {
      console.error('email send out');
      /*await this.usersRepository.deleteUser(user.id);*/
      throw new BadRequestException(`If email send out`);
    }
    return;
  }
  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token);
      return payload;
    } catch (e) {
      throw new BadRequestException('token invalid');
    }
  }
}
//verify work , service adapter
