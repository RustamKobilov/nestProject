import { InjectModel } from '@nestjs/mongoose';
import { Model, UpdateWriteOpResult } from 'mongoose';
import { Device, DeviceDocument } from './Device';
import { Injectable } from '@nestjs/common';
import { mapObject } from '../mapObject';
import { DeviceViewModel } from '../viewModelDTO';

@Injectable()
export class DeviceRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async checkTokenInByUserIdAndTitle(
    userId: string,
    title: string,
  ): Promise<Device | false> {
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
    const tokenUpdate: UpdateWriteOpResult = await this.deviceModel.updateOne(
      { userId: userId, title: title },
      {
        $set: {
          lastActiveDate: lastActiveDate,
          diesAtDate: diesAtDate,
        },
      },
    );
    return tokenUpdate.matchedCount === 1;
  }

  async checkTokenByDeviceInBase(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<Device | boolean> {
    console.log(userId, deviceId, lastActiveDate);
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

  async deleteDevice(deviceId: string) {
    console.log(deviceId);
    return await this.deviceModel.deleteOne({
      deviceId: deviceId,
    });
  }
  async getDevice(deviceId: string): Promise<Device | false> {
    const device = await this.deviceModel.findOne({
      deviceId: deviceId,
    });
    if (!device) {
      return false;
    }
    return device;
  }
  async getDevices(userId: string): Promise<DeviceViewModel[]> {
    const devices = await this.deviceModel
      .find({
        userId: userId,
      })
      .exec();
    const devicesViewModel = await Promise.all(
      devices.map(async (device: Device) => {
        const deviceViewModel = await mapObject.mapDevice(device);
        return deviceViewModel;
      }),
    );
    return devicesViewModel;
  }
  //название класса implements OnModuleInit
  // async onModuleInit() {
  //   console.log(await this.deviceModel.find());
  // }
  //TODO запрос в базу
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
