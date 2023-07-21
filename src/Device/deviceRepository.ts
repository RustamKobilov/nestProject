import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../User/User';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from './Device';

export class DeviceRepository {
  constructor(
    @InjectModel(Device.name) private deviceModel: Model<DeviceDocument>,
  ) {}
  async checkTokenInBaseByName(
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
}
