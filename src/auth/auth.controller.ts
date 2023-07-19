import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './Guard/localGuard';
import { token } from '../Enum';
import { CreateUserDto, RegistrationConfirmation } from '../DTO';
import { UserService } from '../User/userService';

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
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Res() res, @Req() req) {
    const accessToken = await this.authService.signIn(
      req.user.login,
      req.user.password,
    );
    res.cookie(
      [token.accessToken],
      await this.authService.createToken(req.user.id),
      {
        httpOnly: true,
        secure: true,
      },
    );
    return res.status(200).send(accessToken);
  }
  @Post('/registration-confirmation')
  async registrationConfirmation(
    @Body() registrationConfirmation: RegistrationConfirmation,
  ) {
    return await this.authService.verifyToken(registrationConfirmation.code);
    //this.userService.confirmationUser(registrationConfirmation.code);
  }
}
// @Get('profile')
// getProfile(@Request() req) {
//   return req.user;
// }
