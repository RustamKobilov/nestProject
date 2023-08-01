import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { Device, DeviceDocument } from './Device';
import { Injectable } from '@nestjs/common';
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

  async deleteDevice(userId: string, deviceId: string) {
    return await this.deviceModel.deleteOne({
      userId: userId,
      deviceId: deviceId,
    });
  }
}
