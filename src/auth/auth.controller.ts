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
  //TODO UPdate device realize
  async refreshToken(@Res() res, @Req() req) {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log(refreshToken);
      if (!refreshToken) {
        throw new UnauthorizedException('refreshToken 0 //refresh auth');
      }
      const payload = await this.authService.verifyToken(refreshToken);
      if (payload) {
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
      return res.status(200).send(tokens.accessToken);
    } catch (e) {
      return e;
    }
    //const refreshToken = await req.user.payload.userId.sub;
  }
  @Get('/user/:id')
  async userAdmin(@Param('id') userId: string) {
    return this.userService.getUserAdmin(userId);
  }
  @Delete('/user/device')
  async userAdminDelete() {
    return this.authService.deleteAdminDevice();
  }
}
//@UseGuards(JwtAuthGuard)
// @Get('profile')
// getProfile(@Request() req) {
//   return req.user;
// }
