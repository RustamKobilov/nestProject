import {
  BadRequestException,
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
@SkipThrottle()
@Controller('security')
export class SecurityController {
  constructor(private readonly devicesService: DeviceService) {}
  @UseGuards(RefreshTokenGuard)
  @Get('/devices')
  async getDevices(@Req() req, @Res() res) {
    const userId = req.refreshTokenPayload.userId;
    const devices = await this.devicesService.getDevices(userId);

    return res.send(devices).status(200);
  }
  @UseGuards(RefreshTokenGuard)
  @Delete('/devices')
  async deleteDevices(@Req() req, @Res() res) {
    const userId = req.refreshTokenPayload.userId;
    const deviceId = req.refreshTokenPayload.deviceId;
    console.log(userId, deviceId);
    await this.devicesService.deleteDevicesUserExceptForHim(userId, deviceId);

    return res.sendStatus(204);
  }

  @UseGuards(RefreshTokenGuard)
  @Delete('/devices/:deviceId')
  async deleteDevice(@Param('id') deviceId: string, @Req() req, @Res() res) {
    if (!deviceId) {
      throw new BadRequestException('id device not found/ control,dev');
    }
    await this.devicesService.deleteDevice(deviceId);

    return res.sendStatus(204);
  }
}
