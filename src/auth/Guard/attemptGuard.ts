import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AttemptService } from '../Attempt/attemptService';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private attemptService: AttemptService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    // we use a hardcoded string to validate the user for sake of simplicity
    const { ip, url } = request;
    if (!ip && !url) {
      throw new BadRequestException('not found ip,url in req');
    }
    await this.attemptService.createAttempt(url, ip);
    const limit = 5;
    const countAttemptEndpoint = await this.attemptService.checkAttempt(
      url,
      ip,
    );
    // if (countAttemptEndpoint > limit) {
    //   throw new HttpClientErrorException(HttpStatus.TOO_MANY_REQUESTS);
    // }
    return true;
  }
}
