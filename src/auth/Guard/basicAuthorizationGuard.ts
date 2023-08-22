import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Buffer } from 'buffer';

@Injectable()
export class BasicAuthorizationGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    // we use a hardcoded string to validate the user for sake of simplicity
    const auth = request.headers.authorization;
    if (!auth) throw new UnauthorizedException('basic auth/1');

    const authType = auth.split(' ')[0];
    if (authType !== 'Basic') throw new UnauthorizedException('basic auth/2');
    const payload = auth.split(' ')[1];
    if (!payload) throw new UnauthorizedException('basic auth/3');

    const decodedPayload = Buffer.from(payload, 'base64').toString();
    if (!decodedPayload) throw new UnauthorizedException('basic auth/4');
    const login = decodedPayload.split(':')[0];
    const password = decodedPayload.split(':')[1];
    if (login !== 'admin' || password !== 'qwerty')
      throw new UnauthorizedException('basic auth/5');

    return true;
  }
}
