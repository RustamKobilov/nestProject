import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ReactionRepository } from '../Like/reactionRepository';
import { Device } from './Device';
import { mapObject } from '../mapObject';
import { UpdateWriteOpResult } from 'mongoose';
import { NotFoundException } from '@nestjs/common';
import { DeviceViewModel } from '../viewModelDTO';

export class DevicesRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
  async createTokenByUserIdInBase(device: Device) {
    const queryInsertPostEntity = await this.dataSource.query(
      'INSERT INTO device_entity ("deviceId", "userId", "lastActiveDate", "diesAtDate", "title")' +
        ' VALUES ($1,$2, $3, $4, $5)',
      [
        device.deviceId,
        device.userId,
        device.lastActiveDate,
        device.diesAtDate,
        device.title,
      ],
    );
    return;
  }
  async checkTokenInByUserIdAndTitle(
    userId: string,
    title: string,
  ): Promise<Device | false> {
    const table = await this.dataSource.query(
      'SELECT "deviceId", "userId", "lastActiveDate", "diesAtDate", "title"' +
        ' FROM device_entity' +
        ' WHERE device_entity."userId" = $1 AND device_entity."title" = $2',
      [userId, title],
    );
    if (table.length < 1) {
      return false;
    }
    const devices = mapObject.mapDeviceFromSql(table);
    return devices[0];
  }
  async updateExpiredTimeTokenInBaseByDevice(
    userId: string,
    title: string,
    lastActiveDate: string,
    diesAtDate: string,
  ) {
    const update = await this.dataSource.query(
      'UPDATE device_entity' +
        ' SET "lastActiveDate" = $1,"diesAtDate" = $2' +
        ' WHERE "userId" = $3 AND "title" = $4',
      [lastActiveDate, diesAtDate, userId, title],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async checkTokenByDeviceInBase(
    userId: string,
    deviceId: string,
    lastActiveDate: string,
  ): Promise<Device | boolean> {
    const table = await this.dataSource.query(
      'SELECT "deviceId", "userId", "lastActiveDate", "diesAtDate", "title"' +
        ' FROM device_entity' +
        ' WHERE device_entity."userId" = $1 AND device_entity."deviceId" = $2' +
        ' AND device_entity."lastActiveDate" = $3',
      [userId, deviceId, lastActiveDate],
    );
    if (table.length < 1) {
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
    const update = await this.dataSource.query(
      'UPDATE device_entity' +
        ' SET "lastActiveDate" = $1,"diesAtDate" = $2' +
        ' WHERE "userId" = $3 AND "deviceId" = $4',
      [lastActiveDate, diesAtDate, userId, deviceId],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async deleteDevice(deviceId: string) {
    console.log(deviceId + 'delete device');
    const deleteDevice = await this.dataSource.query(
      'DELETE FROM device_entity' + ' WHERE "deviceId" = $1',
      [deviceId],
    );
    console.log(deleteDevice[1]);
    if (deleteDevice[1] != 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return true;
  }
  async getDevice(deviceId: string): Promise<Device | false> {
    const table = await this.dataSource.query(
      'SELECT "deviceId", "userId", "lastActiveDate", "diesAtDate", "title"' +
        ' FROM device_entity' +
        ' WHERE device_entity."deviceId" = $1',
      [deviceId],
    );
    if (table.length < 1) {
      return false;
    }
    const devices = mapObject.mapDeviceFromSql(table);
    return devices[0];
  }
  async getDevices(userId: string): Promise<DeviceViewModel[]> {
    const table = await this.dataSource.query(
      'SELECT "deviceId", "userId", "lastActiveDate", "diesAtDate", "title"' +
        ' FROM device_entity' +
        ' WHERE device_entity."userId" = $1',
      [userId],
    );
    const devices = mapObject.mapDeviceFromSql(table);
    return devices;
  }
  async deleteDevicesExceptForHim(deviceId: string, userId: string) {
    const deleteDevice = await this.dataSource.query(
      'DELETE FROM device_entity' +
        ' WHERE device_entity."userId" = $1' +
        ' NOT IN (device_entity."deviceId" = $2)',
      [userId, deviceId],
    );
    console.log(deleteDevice[1]);
    if (deleteDevice[1] > 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return true;
  }
}
