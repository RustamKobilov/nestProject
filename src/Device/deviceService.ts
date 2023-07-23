import { DeviceRepository } from './deviceRepository';
import { Device } from './Device';
import jwt from 'jsonwebtoken';

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
    const payload: any = jwt.decode(refreshToken);
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
    await this.deviceRepository.updateTokenInBase(
      userId,
      title,
      lastActiveDate,
      diesAtDate,
    );
    return;
  }

  async checkTokenInBaseByName(userId: string, title: string) {
    return await this.deviceRepository.checkTokenInbyUserIdAndTitle(
      userId,
      title,
    );
  }
}
