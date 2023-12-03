import { InjectRepository } from '@nestjs/typeorm';
import { PostEntity } from '../Post/Post.Entity';
import { Repository } from 'typeorm';
import { DeviceEntity } from './Device.Entity';
import { Device } from './Device';
import { mapObject } from '../mapObject';
import { CommentEntity } from '../Comment/Comment.Entity';
import { NotFoundException } from '@nestjs/common';
import { DeviceViewModel } from '../viewModelDTO';

export class DeviceRepositoryTypeORM {
  constructor(
    @InjectRepository(DeviceEntity)
    private readonly deviceRepositoryTypeOrm: Repository<DeviceEntity>,
  ) {}

  async createTokenByUserIdInBase(device: Device) {
    const qbDevice = await this.deviceRepositoryTypeOrm.save({
      deviceId: device.deviceId,
      userId: device.userId,
      lastActiveDate: device.lastActiveDate,
      diesAtDate: device.diesAtDate,
      title: device.title,
      ip: device.ip,
    });
    return;
  }

  async checkTokenInByUserIdAndTitle(
    userId: string,
    title: string,
  ): Promise<Device | false> {
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const take = await qbDevice
      .where('d.userId = :userId AND d.title = :title', {
        userId: userId,
        title: title,
      })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }
    const devices = mapObject.mapRawManyQBOnTableName(take, ['d' + '_']);

    const devicesViewModel = mapObject.mapDeviceFromSql(devices);
    return devicesViewModel[0];
  }

  async updateExpiredTimeTokenInBaseByDevice(
    userId: string,
    title: string,
    lastActiveDate: string,
    diesAtDate: string,
  ) {
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const update = await qbDevice
      .update(DeviceEntity)
      .set({
        lastActiveDate: lastActiveDate,
        diesAtDate: diesAtDate,
      })
      .where('userId = :userId AND title = :title', {
        userId: userId,
        title: title,
      })
      .execute();
    if (!update.affected) {
      return false;
    }
    return true;
  }
  async checkTokenByDeviceInBase(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<Device | boolean> {
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const take = await qbDevice
      .where(
        'd.userId = :userId AND d.deviceId = :deviceId AND d.lastActiveDate = :lastActiveDate',
        {
          userId: userId,
          deviceId: deviceId,
          lastActiveDate: lastActiveDate,
        },
      )
      .getRawMany();
    if (take.length < 1) {
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
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const update = await qbDevice
      .update(DeviceEntity)
      .set({
        lastActiveDate: lastActiveDate,
        diesAtDate: diesAtDate,
      })
      .where('userId = :userId AND deviceId = :deviceId', {
        userId: userId,
        deviceId: deviceId,
      })
      .execute();
    if (!update.affected) {
      return false;
    }
    return true;
  }
  async deleteDevice(deviceId: string) {
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const deleteOperation = await qbDevice
      .delete()
      .where('deviceId = :deviceId', {
        deviceId: deviceId,
      })
      .execute();
    if (deleteOperation.affected !== 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return true;
  }
  async getDevice(deviceId: string): Promise<Device | false> {
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const take = await qbDevice
      .where('d.deviceId = :deviceId', {
        deviceId: deviceId,
      })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }
    const devices = mapObject.mapRawManyQBOnTableName(take, ['d' + '_']);
    const deviceViewModel = mapObject.mapDeviceFromSql(devices);
    return deviceViewModel[0];
  }
  async getDevices(userId: string): Promise<DeviceViewModel[]> {
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const take = await qbDevice
      .where('d.userId = :userId', {
        userId: userId,
      })
      .getRawMany();

    const devicesSQL = mapObject.mapRawManyQBOnTableName(take, ['d' + '_']);
    const deviceViewModel = mapObject.mapDevicesFromSql(devicesSQL);
    return deviceViewModel;
  }
  async deleteDevicesExceptForHim(deviceId: string, userId: string) {
    const qbDevice = await this.deviceRepositoryTypeOrm.createQueryBuilder('d');
    const deleteOperation = await qbDevice
      .delete()
      .where('userId = :userId AND NOT deviceId = :deviceId', {
        userId: userId,
        deviceId: deviceId,
      })
      .execute();
    return true;
  }
}
