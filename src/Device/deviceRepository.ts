import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../User/User';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from './Device';

export class DeviceRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async checkTokenInbyUserIdAndTitle(
    userId: string,
    title: string,
  ): Promise<Device | false> {
    const device = await this.deviceModel
      .findOne({
        userId: userId,
        title: title,
      })
      .lean();
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
  async updateTokenInBase(
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
}
