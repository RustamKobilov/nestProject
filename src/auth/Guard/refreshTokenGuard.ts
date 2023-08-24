import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from '../auth.service';
import { UserRepository } from '../../User/userRepository';
import { JwtServices } from '../../application/jwtService';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(
    private jwtService: JwtServices,
    private readonly userRepository: UserRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const refreshToken = request.cookies.refreshToken;
    if (!refreshToken)
      throw new UnauthorizedException('refresh token not found /refreshGuard');
    const payload = await this.jwtService.verifyToken(refreshToken);
    if (!payload)
      throw new UnauthorizedException('verify failed /refreshGuard');
    const user = await this.userRepository.getUser(payload.userId);
    if (!user) throw new UnauthorizedException('user not found /refreshGuard');
    console.log(payload);
    request.refreshTokenPayload = payload;
    return true;
  }
}
