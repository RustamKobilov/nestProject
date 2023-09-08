import { AuthService } from './auth.service';
import { JwtServices } from '../application/jwtService';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { DeviceRepository } from '../Device/deviceRepository';
import { DeviceService } from '../Device/deviceService';
import { CommandBus } from '@nestjs/cqrs';
import { UserService } from '../User/userService';
import { UserRepository } from '../User/userRepository';
import { User, UserDocument } from '../User/User';
import { Model } from 'mongoose';
import { Device, DeviceDocument } from '../Device/Device';
import { ModuleRef } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';

describe('integration test for AuthService', () => {
  // const userRepository = new UserRepository(@InjectModel(User.name) private userModel: Model<UserDocument>);
  // const usersService = new UserService(userRepository);
  // //---------
  // const jwtService = new JwtService();
  // const configService = new ConfigService();
  // const jwtServices = new JwtServices(jwtService, configService);
  // //---------
  // const deviceRepository = new DeviceRepository(@InjectModel(Device.name) private deviceModel: Model<DeviceDocument>);
  // const devicesService = new DeviceService(deviceRepository);
  // //---------
  // const commandsBus = new CommandBus(ModuleRef);
  // //---------
  // const authService = new AuthService(
  //   usersService,
  //   jwtServices,
  //   devicesService,
  //   commandsBus,
  // );

  describe('createUser', () => {
    it('should return', async () => {
      // const result = await authService.getUserAdmin(
      //   '/7c8e904c-5075-4425-b03c-6f17f8c1ac31',
      // );
      // expect(result.login).toBe('ulogin21');
    });
  });
});
