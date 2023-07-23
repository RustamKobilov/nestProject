import {
  Body,
  Controller,
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
  @Get('/user/:id')
  async userAdmin(@Param('id') userId: string) {
    return this.userService.getUserAdmin(userId);
  }
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Res() res, @Req() req) {
    const token = await this.authService.signIn(
      req.user.login,
      req.user.password,
      req.ip,
      req.headers['user-agent'] || 'userAgentNull',
    );
    // const result = await this.authService.getLastActiveDateFromRefreshToken(
    //   token.refreshToken,
    // );
    //console.log(result);
    // await this.authService.registrationAttempt(req.ip,user);
    // await this.getTokens(user.id)

    console.log(token);
    res.cookie([token.refreshToken], token.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send(token.accessToken);
    //TODO не забыть поставиь поле accees token in body
  }
  @UseGuards(JwtAuthGuard)
  @Post('/refresh-token')
  //TODO UPdate device realize
  async refreshToken(@Res() res, @Req() req) {
    console.log(req.user.userId.sub);
    const tokens = await this.authService.getTokens(
      req.user.userId.sub,
      'lipa peredelyat na update',
    );
    res.cookie([token.refreshToken], tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send(tokens.accessToken);
  }
}
// @Get('profile')
// getProfile(@Request() req) {
//   return req.user;
// }
