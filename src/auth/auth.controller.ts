import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './Guard/localGuard';
import { token } from '../Enum';
import {
  CreateUserDto,
  EmailPasswordRecoveryDTO,
  UpdatePasswordDTO,
  RegistrationConfirmation,
} from '../DTO';
import { RefreshTokenGuard } from './Guard/refreshTokenGuard';
import { JwtServices } from '../application/jwtService';
import { SkipThrottle } from '@nestjs/throttler';
import { BearerGuard } from './Guard/bearerGuard';
import { CommandBus } from '@nestjs/cqrs';
import { GetConfirmationCodeForUserCommand } from '../User/use-cases/get-confirmation-code-for-user';
import { GetUserInformationUseCaseCommand } from '../User/use-cases/get-user-information-use-case';
import { UpdatePasswordUserUseCaseCommand } from '../User/use-cases/update-password-user-use-case';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private jwtService: JwtServices,
    private commandBus: CommandBus,
  ) {}

  @Post('/registration')
  async registrationUser(@Res() res, @Body() createUserDto: CreateUserDto) {
    const sendEmailRegistrationUser = await this.authService.registration(
      createUserDto,
    );
    if (!sendEmailRegistrationUser) {
      return res.status(400).send({
        errorsMessages: [
          {
            message: 'email invalid',
            field: 'email',
          },
        ],
      });
    }
    return res.sendStatus(204);
  }
  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Body() registrationConfirmation: RegistrationConfirmation,
    @Res() res,
  ) {
    const checkConfirmation = await this.commandBus.execute(
      new GetConfirmationCodeForUserCommand(registrationConfirmation.code),
    );
    return res.sendStatus(204);
  }

  @Post('/registration-email-resending')
  async registrationEmailResending(
    @Body() emailPasswordRecoveryDTO: EmailPasswordRecoveryDTO,
    @Res() res,
  ) {
    await this.authService.updateConfirmationCodeRepeat(
      emailPasswordRecoveryDTO.email,
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
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send({ accessToken: tokens.accessToken });
    //TODO не забыть поставиь поле accees tokens in body
  }

  @UseGuards(RefreshTokenGuard)
  @Post('/refresh-token')
  async refreshToken(@Res() res, @Req() req) {
    const refreshToken = req.cookies.refreshToken;
    const refreshTokenPayload = req.refreshTokenPayload;
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
    // if (!refreshTokenDevice) {
    //   throw new UnauthorizedException('no update Token');
    // }
    res.cookie([token.refreshToken], tokens.refreshToken, {
      expires: new Date(Date.now() + 60000),
      httpOnly: true,
      secure: true,
    });
    //60000
    return res.status(200).send({ accessToken: tokens.accessToken });

    //const refreshToken = await req.user.payload.userId.sub;
  }
  @SkipThrottle()
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
  @SkipThrottle()
  @UseGuards(BearerGuard)
  @Get('/me')
  async getProfile(@Req() req, @Res() res) {
    const outputUser = await this.commandBus.execute(
      new GetUserInformationUseCaseCommand(req.user.id),
    );
    return res.status(200).send(outputUser);
  }
  @Post('/password-recovery')
  async passwordRecoveryUser(
    @Res() res,
    @Req() req,
    @Body() email: EmailPasswordRecoveryDTO,
  ) {
    const sendMailRecoveryPassword = await this.authService.recoveryPassword(
      email.email,
    );
    if (!sendMailRecoveryPassword) {
      return res.status(400).send({
        errorsMessages: [
          {
            message: 'email invalid',
            field: 'email',
          },
        ],
      });
    }
    return res.sendStatus(204);
  }
  @Post('/new-password')
  async updatePasswordUser(
    @Res() res,
    @Req() req,
    @Body() newPasswordBody: UpdatePasswordDTO,
  ) {
    const passwordUpdate = await this.commandBus.execute(
      new UpdatePasswordUserUseCaseCommand(newPasswordBody),
    );
    return res.sendStatus(204);
  }

  //______________________________________ADMIN______________
  @Get('/admin/user/:userId')
  async userAdmin(@Param('userId') userId: string, @Req() req) {
    console.log('admin zapros');
    return this.authService.getUserAdmin(userId);
  }
}
