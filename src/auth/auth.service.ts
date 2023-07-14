import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserRepository } from '../User/userRepository';
import { UserService } from '../User/userService';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private usersRepository: UserRepository /*private jwtService: JwtService,*/,
  ) {}

  //async signIn(login, password) {
  // const user = await this.usersService.findOne(username);
  // if (user?.password !== pass) {
  //   throw new UnauthorizedException();
  // }
  // const payload = { username: user.username, sub: user.userId };
  // return {
  //   access_token: await this.jwtService.signAsync(payload),
  // };
  //}
  // async registration(createUserDto: CreateUserDtoAdmin) {
  //   const user = await this.usersService.createNewUserRegistration(
  //     createUserDto,
  //   );
  //   try {
  //     await emailAdapters.gmailSendEmailRegistration(
  //       createUserDto.email,
  //       user.userConfirmationInfo.code,
  //     );
  //   } catch (error) {
  //     console.error('email send out');
  //     await this.usersRepository.deleteUser(user.id);
  //     throw new BadRequestException(`If email send out`);
  //   }
  //   return;
  // }
}
