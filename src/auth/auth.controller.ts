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
    console.log('est');
    return res.sendStatus(204);
    //this.userService.confirmationUser(registrationConfirmation.code);
  }
  @Get('/user/:id')
  async userAdmin(@Param('id') userId: string) {
    return this.userService.getUserAdmin(userId);
  }
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Res() res, @Req() req) {
    const tokens = await this.authService.signIn(
      req.user.login,
      req.user.password,
    );
    res.cookie([token.accessToken], tokens.refreshToken, {
      httpOnly: true,
      secure: true,
    });
    return res.status(200).send(tokens.accessToken);
  }
  @UseGuards(JwtAuthGuard)
  @Post('/refresh-token')
  async refreshToken(@Res() res, @Req() req) {
    console.log(req.user);
    return res.status(200).send('tokens.accessToken');
  }
}
// @Get('profile')
// getProfile(@Request() req) {
//   return req.user;
// }
