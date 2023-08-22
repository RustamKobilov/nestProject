import { DeviceRepository } from './deviceRepository';
import { Device } from './Device';
import jwt from 'jsonwebtoken';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { de } from 'date-fns/locale';
import { DeviceViewModel } from '../viewModelDTO';
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
  async getDevices(userId: string): Promise<DeviceViewModel[]> {
    return await this.deviceRepository.getDevices(userId);
  }
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
    const deviceUpdate =
      await this.deviceRepository.updateExpiredTimeTokenInBaseByDevice(
        userId,
        title,
        lastActiveDate,
        diesAtDate,
      );
    if (!deviceUpdate) {
      throw new BadRequestException('deviceId no update /deviceService');
    }
    return;
  }

  async checkTokenByNameAndTitle(
    userId: string,
    title: string,
  ): Promise<Device | false> {
    return await this.deviceRepository.checkTokenInByUserIdAndTitle(
      userId,
      title,
    );
  }
  async checkTokenByDevice(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<Device | boolean> {
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
    const updateRefreshTokenDevice =
      await this.deviceRepository.refreshTokenDeviceInBase(
        userId,
        deviceId,
        lastActiveDate,
        diesAtDate,
      );
    if (!updateRefreshTokenDevice) {
      throw new BadRequestException(
        'refreshTokenDevice no update /deviceService',
      );
    }
    return;
  }
  async deleteAdmin() {
    return await this.deviceRepository.deleteDevicesAdmin();
  }

  async getDeviceAdminById(deviceId: string) {
    return await this.deviceRepository.getDeviceByIdAdmin(deviceId);
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

  async deleteDevicesUserExceptForHim(userId: string, deviceId: string) {
    return await this.deviceRepository.deleteDevicesExceptForHim(
      deviceId,
      userId,
    );
  }
  async getDevice(deviceId: string) {
    const device = await this.deviceRepository.getDevice(deviceId);
    if (!device) {
      throw new BadRequestException(
        'deviceId not found for device /deviceService',
      );
    }
    return device;
  }
}
