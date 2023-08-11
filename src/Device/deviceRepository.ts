import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { Device, DeviceDocument } from './Device';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async checkTokenInbyUserIdAndTitle(
    userId: string,
    title: string,
  ): Promise<Device | false> {
    console.log('tut repa');
    const device = await this.deviceModel.findOne({
      userId: userId,
      title: title,
    });
    console.log(device);
    if (!device) {
      return false;
    }
    return device;
  }
  async createTokenByUserIdInBase(device: Device) {
    const createDevice = new this.deviceModel(device);
    await createDevice.save();
    return;
  }
  async updateExpiredTimeTokenInBaseByDevice(
    userId: string,
    title: string,
    lastActiveDate: string,
    diesAtDate: string,
  ) {
    const tokenUpdate = await this.deviceModel.updateOne(
      { userId: userId, title: title },
      {
        $set: {
          lastActiveDate: lastActiveDate,
          diesAtDate: diesAtDate,
        },
      },
    );
    return;
  }

  async checkTokenByDeviceInBase(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ) {
    console.log('repa');
    console.log(userId, deviceId, lastActiveDate);
    const result = await this.deviceModel.findOne({
      userId: userId,
      deviceId: deviceId,
      lastActiveDate: lastActiveDate,
    });
    console.log(result);
    if (!result) {
      return false;
    }
    return true;
  }
  async refreshTokenDeviceInBase(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
    diesAtDate: string,
  ) {
    const tokenUpdate: UpdateWriteOpResult = await this.deviceModel.updateOne(
      { userId: userId, deviceId: deviceId },
      {
        $set: {
          lastActiveDate: lastActiveDate,
          diesAtDate: diesAtDate,
        },
      },
    );
    return tokenUpdate.matchedCount === 1;
  }

  async deleteDevice(deviceId: string) {
    return await this.deviceModel.deleteOne({
      deviceId: deviceId,
    });
  }
  async getDevices(userId: string): Promise<Device> {
    const devices = await this.deviceModel.find({
      userId: userId,
    });
    if (devices) {
      throw new NotFoundException('device no, devRep');
    }
    return devices;
  }
  async deleteDevicesExceptForHim(deviceId: string, userId: string) {
    await this.deviceModel.deleteMany({
      userId: userId,
      deviceId: { $ne: deviceId },
    });
  }
  //_____________________________________________
  async deleteDevicesAdmin() {
    console.log('delete all device');
    return await this.deviceModel.deleteOne({});
  }

  async getDeviceByIdAdmin(deviceId: string) {
    const result = await this.deviceModel.find({
      /*deviceId: deviceId,*/
    });
    return result;
  }
}
