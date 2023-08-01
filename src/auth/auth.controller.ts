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

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UserService,
    private authService: AuthService /*private jwtService: ApiJwtService,*/,
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
    await this.userService.confirmationUser(registrationConfirmation.code);
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
    // const result = await this.authService.getLastActiveDateFromRefreshToken(
    //   tokens.refreshToken,
    // );
    //console.log(result);
    // await this.authService.registrationAttempt(req.ip,user);
    // await this.getTokens(user.id)

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

  @Post('/refresh-token')
  async refreshToken(@Res() res, @Req() req) {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('refreshToken 0 //refresh auth');
    }
    const payload = await this.authService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('refreshToken expired controller');
    }
    const checkTokenForUser = await this.authService.checkRefreshTokenForUser(
      refreshToken,
      payload.userId,
      payload.deviceId,
    );
    const tokens = await this.authService.getTokens(
      payload.userId,
      payload.deviceId,
    );
    const refreshTokenDevice = await this.authService.refreshTokenDevice(
      tokens.refreshToken,
      payload.userId,
      payload.deviceId,
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

  @Post('/logout')
  async logout(@Res() res, @Req() req) {
    const refreshToken = req.cookies.refreshToken;
    console.log(refreshToken);
    if (!refreshToken) {
      throw new UnauthorizedException('refreshToken 0 //refresh auth');
    }
    const payload = await this.authService.verifyToken(refreshToken);
    if (!payload) {
      throw new UnauthorizedException('refreshToken expired controller');
    }
    const checkTokenForUser = await this.authService.checkRefreshTokenForUser(
      refreshToken,
      payload.userId,
      payload.deviceId,
    );
    const deleteDeviceUser = await this.authService.deleteDeviceInLogout(
      payload.userId,
      payload.deviceId,
    );
    if (!deleteDeviceUser) {
      return res.status(404).send('delete not successful');
    }
    return res.sendStatus(204);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  async getProfile(@Req() req, @Res() res) {
    console.log(req.user.userId);
    const outputUser = await this.userService.getUserInformation(
      req.user.userId,
    );
    return res.status(200).send(outputUser);
  }

  //___________________________________________________
  @Get('/admin/user/:userId')
  async userAdmin(@Param('userId') userId: string, @Req() req) {
    return this.userService.getUserAdmin(userId);
  }
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
