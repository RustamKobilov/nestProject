import { UserService } from '../../User/userService';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { LoginDtoStrategy } from '../../DTO';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UserService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(login: string, password: string) {
    console.log(password);
    console.log(login);
    const loginDto = new LoginDtoStrategy();
    loginDto.login = login;
    loginDto.password = password;
    await validate(loginDto).then((errors: ValidationError[]) => {
      if (errors.length > 0) {
        errors.map((value) => {
          console.log(value.property);
          console.log(value.constraints);
          throw new UnauthorizedException();
        });
      }
    });
    //await this.usersService
    return loginDto;
  }
}
