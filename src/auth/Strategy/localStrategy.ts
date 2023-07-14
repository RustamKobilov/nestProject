import { UserService } from '../../User/userService';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UserService) {
    super({
      usernameField: 'loginOrEmail',
    });
  }

  async validate(login: string, password: string): Promise<any> {
    console.log('validate');
    console.log(login);
    console.log(password);
    return { loginOrEmail: 'string' };
  }
}
