import { Body, Controller, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from '../User/User';
import { LocalAuthGuard } from './Guard/localGuard';
import { LoginDto } from '../DTO';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService /*private jwtService: ApiJwtService,*/,
  ) {}
  // @Post('/registration')
  // async registrationUser(@Body() createUserDto: CreateUserDtoAdmin) {
  //   return this.authService.registration(createUserDto);
  // }
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  login(@Res() res, loginDto: LoginDto) {
    //validate yes
    //   res.cookie(
    //     'refreshToken',
    //     await this.jwtService.createRefreshToken(user.id),
    //     {
    //       httpOnly: true,
    //       secure: true,
    //     },
    //   );
    //   return res.send({
    //     access_token: await this.jwtService.createAccessTokenJWT(user.id),
    //   });
    console.log(loginDto);
    return res.sendStatus(200);
  }

  // @Get('profile')
  // getProfile(@Request() req) {
  //   return req.user;
  // }
}
