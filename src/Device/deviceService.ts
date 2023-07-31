import { DeviceRepository } from './deviceRepository';
import { Device } from './Device';
import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
@Injectable()
export class DeviceService {
  constructor(private deviceRepository: DeviceRepository) {}
  private async createDevice(
    userId: string,
    title: string,
    ip: string,
    deviceId: string,
    lastActiveDate: string,
    diesAtDate: string,
  ) {
    const device: Device = {
      userId: userId,
      title: title,
      ip: ip,
      deviceId: deviceId,
      lastActiveDate: lastActiveDate,
      diesAtDate: diesAtDate,
    };

    return device;
  }
  async getLastActiveDateFromRefreshToken(refreshToken: string) {
    console.log(refreshToken);
    console.log('refreshToken');
    const payload: any = jwt.decode(refreshToken);
    console.log(payload);
    return new Date(payload.iat * 1000).toISOString();
  }
  async getDiesAtDate(refreshToken: string) {
    const payload: any = jwt.decode(refreshToken);
    return new Date(payload.exp * 1000).toISOString();
  }
  async addDevice(
    refreshToken: string,
    userId: string,
    title: string,
    ip: string,
    deviceId: string,
  ) {
    const lastActiveDate = await this.getLastActiveDateFromRefreshToken(
      refreshToken,
    );
    const diesAtDate = await this.getDiesAtDate(refreshToken);
    const device = await this.createDevice(
      userId,
      title,
      ip,
      deviceId,
      lastActiveDate,
      diesAtDate,
    );
    await this.deviceRepository.createTokenByUserIdInBase(device);
  }

  async updateDevice(refreshToken: string, userId: string, title: string) {
    const lastActiveDate = await this.getLastActiveDateFromRefreshToken(
      refreshToken,
    );
    const diesAtDate = await this.getDiesAtDate(refreshToken);
    await this.deviceRepository.updateExpiredTimeTokenInBaseByDevice(
      userId,
      title,
      lastActiveDate,
      diesAtDate,
    );
    return;
  }

  async checkTokenByNameAndTitle(
    userId: string,
    title: string,
  ): Promise<Device | false> {
    console.log('tut');
    console.log(userId, title);
    return await this.deviceRepository.checkTokenInbyUserIdAndTitle(
      userId,
      title,
    );
  }
  async checkTokenByDevice(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ) {
    return await this.deviceRepository.checkTokenByDeviceInBase(
      userId,
      deviceId,
      lastActiveDate,
    );
  }
  async refreshTokenDevice(
    refreshToken: string,
    userId: string,
    deviceId: string,
  ) {
    const diesAtDate = await this.getDiesAtDate(refreshToken);
    const lastActiveDate = await this.getLastActiveDateFromRefreshToken(
      refreshToken,
    );

    return await this.deviceRepository.refreshTokenDeviceInBase(
      userId,
      deviceId,
      lastActiveDate,
      diesAtDate,
    );
  }
  async deleteAdmin() {
    return await this.deviceRepository.deleteDevicesAdmin();
  }
}
