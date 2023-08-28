import { CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../User/userRepository';
import { JwtServices } from '../../application/jwtService';

export class IdenteficationUserGuard implements CanActivate {
  constructor(
    private jwtService: JwtServices,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // we use a hardcoded string to validate the user for sake of simplicity
    console.log('on1 stap');
    const inputToken = request.headers.authorization;
    if (!inputToken) {
      request.user = null;
      return true;
    }
    console.log('on2 stap');
    const [typeToken, token] = inputToken.split(' ');
    if (typeToken !== 'Bearer' || !token) {
      request.user = null;
      return true;
    }
    console.log('on3 stap');
    const payload = await this.jwtService.verifyToken(token);
    if (!payload) {
      request.user = null;
      return true;
    }
    console.log('on4 stap');
    const user = await this.userRepository.getUser(payload.userId);
    if (!user) {
      request.user = null;
      return true;
    }
    request.user = user;
    return true;
  }
}
