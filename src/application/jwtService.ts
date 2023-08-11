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
      console.log(payload);
      return payload;
    } catch (e) {
      console.log(e);
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

  // }
  // async checkTokenInBase(userId: string,deviceId:string,lastActiveDate:string){
  //   const resultCheckToken=await DeviceModel.findOne({userId:userId,deviceId:deviceId,lastActiveDate:lastActiveDate})
  //   if(!resultCheckToken){
  //     return false
  //   }
  //   return true
  // }
  // async checkTokenInBaseByName(userId: string, title:string):Promise<string|false>{
  //   const resultCheckToken = await DeviceModel.findOne({userId: userId, title: title})
  //   if (!resultCheckToken) {
  //     return false
  //   }
  //   return resultCheckToken.deviceId
  // }
  // async createTokenByUserIdInBase(userId: string,
  //                                 paginationUserInformation:UserInformationType,
  //                                 deviceId:string, lastActiveDate:string,diesAtDate:string) {
  //
  //
  //   await DeviceModel.insertMany({
  //     lastActiveDate:lastActiveDate,
  //     diesAtDate:diesAtDate,
  //     deviceId:deviceId,
  //     title:paginationUserInformation.title,
  //     ip:paginationUserInformation.ipAddress,
  //     userId:userId
  //   })
  //
  // }
  // async updateTokenInBase(userId:string, title:string, lastActiveDate:string, diesAtDate:string){
  //
  //   const tokenUpdate=await DeviceModel.
  //   updateOne({userId:userId,title: title },{
  //     $set: {
  //       lastActiveDate:lastActiveDate,
  //       diesAtDate:diesAtDate
  //     }
  //   })
  //   return tokenUpdate.matchedCount === 1
  // }
  // async refreshTokenInBase(userId:string, deviceId:string, lastActiveDate:string, diesAtDate:string){
  //   const tokenUpdate=await DeviceModel.
  //   updateOne({userId:userId,deviceId:deviceId},{
  //     $set: {
  //       lastActiveDate:lastActiveDate,
  //       diesAtDate:diesAtDate
  //     }
  //   })
  //   return tokenUpdate.matchedCount === 1
  // }
  // async deleteTokenRealize(userId:string,deviceId:string){
  //   const deleteToken=await DeviceModel.deleteOne({userId:userId,deviceId:deviceId})
  //   if(!deleteToken){
  //     return false
  //   }
  //   return true
  // }
}
