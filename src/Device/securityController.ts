import {
  Controller,
  Delete,
  Get,
  Param,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { DeviceService } from './deviceService';
import { RefreshTokenGuard } from '../auth/Guard/refreshTokenGuard';
import { SkipThrottle } from '@nestjs/throttler';
import { CommandBus } from '@nestjs/cqrs';
import { GetDevicesUseCaseCommand } from './use-case/get-devices-use-case';
import { DeleteDevicesUseCaseCommand } from './use-case/delete-devices-use-case';
import { GetDeviceUseCaseCommand } from './use-case/get-device-use-case';

@SkipThrottle()
@Controller('security')
export class SecurityController {
  constructor(
    private readonly devicesService: DeviceService,
    private commandBus: CommandBus,
  ) {}
  @UseGuards(RefreshTokenGuard)
  @Get('/devices')
  async getDevices(@Req() req, @Res() res) {
    const userId = req.refreshTokenPayload.userId;
    const devices = await this.commandBus.execute(
      new GetDevicesUseCaseCommand(userId),
    );

    return res.send(devices).status(200);
  }
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices')
  async deleteDevices(@Req() req, @Res() res) {
    const userId = req.refreshTokenPayload.userId;
    const deviceId = req.refreshTokenPayload.deviceId;
    console.log(userId, deviceId);
    await this.commandBus.execute(
      new DeleteDevicesUseCaseCommand(userId, deviceId),
    );

    return res.sendStatus(204);
  }

  @UseGuards(RefreshTokenGuard)
  @Delete('/devices/:deviceId')
  async deleteDevice(
    @Param('deviceId') deviceId: string,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.refreshTokenPayload.userId;
    const device = await this.commandBus.execute(
      new GetDeviceUseCaseCommand(deviceId),
    );
    if (device.userId !== userId) {
      return res.sendStatus(403);
    }
    await this.devicesService.deleteDevice(deviceId);

    return res.sendStatus(204);
  }
}
