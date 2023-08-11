import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './Guard/localGuard';
import { token } from '../Enum';
import { CreateUserDto, RegistrationConfirmation } from '../DTO';
import { UserService } from '../User/userService';
import { JwtAuthGuard } from './Guard/jwtGuard';
import { RefreshTokenGuard } from './Guard/refreshTokenGuard';
import { JwtServices } from '../application/jwtService';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtServices,
  ) {}

  @Post('/registration')
  async registrationUser(@Res() res, @Body() createUserDto: CreateUserDto) {
    await this.authService.registration(createUserDto);
    return res.sendStatus(204);
  }
  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Body() registrationConfirmation: RegistrationConfirmation,
    @Res() res,
  ) {
    await this.authService.confirmationUserAfterRegistration(
      registrationConfirmation.code,
    );
    return res.sendStatus(204);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Res() res, @Req() req) {
    const tokens = await this.authService.signIn(
      req.user.login,
      req.user.password,
      req.ip,
      req.headers['user-agent'] || 'userAgentNull',
    );

    console.log(tokens);
    res.cookie([token.refreshToken], tokens.refreshToken, {
      expires: new Date(Date.now() + 60000),
      // httpOnly: true,
      // secure: true,
    });
    //60000
    return res.status(200).send(token.accessToken);
    //TODO не забыть поставиь поле accees tokens in body
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  async refreshToken(@Res() res, @Req() req) {
    const refreshToken = req.cookies.refreshToken;
    const refreshTokenPayload = req.refreshTokenPayload; //опвесить гард ревреша
    const checkTokenForUser = await this.authService.checkRefreshTokenForUser(
      refreshToken,
      refreshTokenPayload.userId,
      refreshTokenPayload.deviceId,
    );
    const tokens = await this.jwtService.getTokens(
      refreshTokenPayload.userId,
      refreshTokenPayload.deviceId,
    );
    const refreshTokenDevice = await this.authService.refreshTokenDevice(
      tokens.refreshToken,
      refreshTokenPayload.userId,
      refreshTokenPayload.deviceId,
    );
    if (!refreshTokenDevice) {
      throw new UnauthorizedException('no update Token');
    }
    res.cookie([token.refreshToken], tokens.refreshToken, {
      expires: new Date(Date.now() + 60000),
      // httpOnly: true,
      // secure: true,
    });
    //60000
    return res.status(200).send(token.accessToken);

    //const refreshToken = await req.user.payload.userId.sub;
  }
  @UseGuards(RefreshTokenGuard)
  @Post('/logout')
  async logout(@Res() res, @Req() req) {
    const refreshToken = req.cookies.refreshToken;
    const refreshTokenPayload = req.refreshTokenPayload;
    console.log(refreshToken);
    const checkTokenForUser = await this.authService.checkRefreshTokenForUser(
      refreshToken,
      refreshTokenPayload.userId,
      refreshTokenPayload.deviceId,
    );
    const deleteDeviceUser = await this.authService.deleteDeviceInLogout(
      refreshTokenPayload.deviceId,
    );
    if (!deleteDeviceUser) {
      return res.status(404).send('delete not successful');
    }
    return res.sendStatus(204);
  }

  @UseGuards(RefreshTokenGuard)
  @Get('/me')
  async getProfile(@Req() req, @Res() res) {
    const refreshTokenPayload = req.refreshTokenPayload;
    //TODO null prihodit
    console.log(refreshTokenPayload.id);
    console.log('controller');
    const outputUser = await this.authService.getUserInformation(
      refreshTokenPayload.id,
    );
    return res.status(200).send(outputUser);
  }

  //___________________________________________________
  // @Get('/admin/user/:userId')
  // async userAdmin(@Param('userId') userId: string, @Req() req) {
  //   return this.userService.getUserAdmin(userId);
  // }
  @Get('/admin/device/:deviceId')
  async getDeviceAdmin(@Param('deviceId') deviceId: string, @Res() res) {
    const device = await this.authService.getDeviceAdmin(deviceId);
    return res.send(device);
  }

  @Delete('/user/device')
  async userAdminDelete() {
    return this.authService.deleteAdminDevice();
  }
}
