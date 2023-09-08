import { DeviceRepository } from './deviceRepository';
import jwt from 'jsonwebtoken';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class DeviceService {
  constructor(private deviceRepository: DeviceRepository) {}
  async getLastActiveDateFromRefreshToken(refreshToken: string) {
    console.log(refreshToken);
    console.log('refreshToken');
    const payload: any = jwt.decode(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('payload getLastActive');
    }
    console.log(payload);
    return new Date(payload.iat * 1000).toISOString();
  }
  async getDiesAtDate(refreshToken: string) {
    console.log(refreshToken);
    const payload: any = jwt.decode(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('payload getDiesAtDate');
    }

    return new Date(payload.exp * 1000).toISOString();
  }
  async deleteDevice(deviceId: string) {
    const device = await this.deviceRepository.getDevice(deviceId);
    if (!device) {
      throw new BadRequestException(
        'deviceId not found for device /deviceService',
      );
    }
    return await this.deviceRepository.deleteDevice(deviceId);
  }
}
