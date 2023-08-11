import {
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from '../../User/userRepository';
import { JwtServices } from '../../application/jwtService';

export class BearerGuard implements CanActivate {
  constructor(
    private jwtService: JwtServices,
    private userRepository: UserRepository,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // we use a hardcoded string to validate the user for sake of simplicity
    const inputToken = request.headers.authorization;
    if (!inputToken) {
      throw new UnauthorizedException('not found authorization token');
    }
    const [typeToken, token] = inputToken.split(' ');
    if (typeToken !== 'Bearer' || !token) {
      throw new UnauthorizedException();
    }
    const payload = await this.jwtService.verifyToken(token);
    if (!payload) {
      throw new UnauthorizedException('verify failed');
    }
    const user = await this.userRepository.getUser(payload.userId);
    if (!user) {
      throw new UnauthorizedException('user not found');
    }
    request.user = user;
    return true;
  }
}