import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRepository } from '../../User/userRepository';
import { JwtServices } from '../../application/jwtService';

@Injectable()
export class IdenteficationUserGuard implements CanActivate {
  constructor(
    private jwtService: JwtServices,
    private userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // we use a hardcoded string to validate the user for sake of simplicity
    const inputToken = request.headers.authorization;
    if (!inputToken) {
      request.user = null;
      return true;
    }
    const [typeToken, token] = inputToken.split(' ');
    if (typeToken !== 'Bearer' || !token) {
      request.user = null;
      return true;
    }
    const payload = await this.jwtService.verifyToken(token);
    if (!payload) {
      request.user = null;
      return true;
    }
    const user = await this.userRepository.getUser(payload.userId);
    if (!user) {
      request.user = null;
      return true;
    }
    request.user = user;
    return true;
  }
}
