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
    const result = await this.deviceModel.findOne({
      userId: userId,
      deviceId: deviceId,
      lastActiveDate: lastActiveDate,
    });
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
}
