import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserRepository } from '../../User/userRepository';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private usersRepository: UserRepository) {
    super({
      usernameField: 'login',
    });
  }

  async validate(login: string, password: string): Promise<any> {
    const user = await this.usersRepository.getUserbyLogin(login);
    if (!user) throw new UnauthorizedException();
    return true;
  }
}
