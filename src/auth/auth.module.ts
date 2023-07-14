// @Module({
//   imports: [
//     UsersModule,
//     JwtModule.register({
//       global: true,
//       secret: jwtConstants.secret,
//       signOptions: { expiresIn: '60s' },
//     }),
//   ],
//   providers: [
//     AuthService,
//     // {
//     //   provide: APP_GUARD,
//     //   useClass: AuthGuard,
//     // },
//   ],
//   controllers: [AuthController],
//   exports: [AuthService],
// })
// export class AuthModule {}
