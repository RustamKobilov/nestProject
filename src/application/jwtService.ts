import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtServices {
  constructor(
    private jwtService: JwtService,

    private configService: ConfigService,
  ) {}

  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verify(token);
      return payload;
    } catch (e) {
      console.log(e + ' error verifyJwtToken');
      return false;
    }
  }
  async getAccessToken(userId: string) {
    return await this.jwtService.signAsync(
      { userId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRED'),
      },
    );
  }
  async getRefreshToken(userId: string, deviceId: string) {
    return await this.jwtService.signAsync(
      { userId, deviceId },
      {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRED'),
      },
    );
  }
  async getTokens(userId: string, deviceId: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_ACCESS_EXPIRED'),
        },
      ),
      this.jwtService.signAsync(
        {
          userId,
          deviceId,
        },
        {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRED'),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
    };
  }
}
