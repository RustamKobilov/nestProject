import { Module } from '@nestjs/common';
import { UserController } from './User/userController';
import { UserService } from './User/userService';
import { UserRepository } from './User/userRepository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  UserRecoveryPasswordInfo,
  User,
  UserConfirmationInfo,
  UserConfirmationInfoSchema,
  UserSchema,
  UserRecoveryPasswordInfoSchema,
} from './User/User';
import { DeleteBase } from './deleteBase';
import { Blog, BlogSchema } from './Blog/Blog';
import { BlogController } from './Blog/blogController';
import { BlogService } from './Blog/blogService';
import { BlogRepository } from './Blog/blogRepository';
import {
  ExtendedLikesInfo,
  ExtendedLikesInfoSchema,
  NewestLikes,
  NewestLikesSchema,
  Post,
  PostSchema,
} from './Post/Post';
import { PostController } from './Post/postController';
import { PostService } from './Post/postService';
import { PostRepository } from './Post/postRepository';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { LocalStrategy } from './auth/Strategy/localStrategy';
import { AuthService } from './auth/auth.service';
import { PassportModule } from '@nestjs/passport';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { EmailAdapters } from './adapters/email-adapters';
import * as dotenv from 'dotenv';
import { JwtStrategy } from './auth/Strategy/jwtStrategy';
import { DeviceRepository } from './Device/deviceRepository';
import { Device, DeviceSchema } from './Device/Device';
import { DeviceService } from './Device/deviceService';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import {
  Comment,
  CommentatorInfo,
  CommentatorInfoSchema,
  CommentSchema,
  LikesInfo,
  LikesInfoSchema,
} from './Comment/Comment';
import { CommentController } from './Comment/commentController';
import { CommentService } from './Comment/commentService';
import { CommentRepository } from './Comment/commentRepository';
import { ReactionRepository } from './Like/reactionRepository';
import { Reaction, ReactionSchema } from './Like/Reaction';
import { SecurityController } from './Device/securityController';
import { JwtServices } from './application/jwtService';
import {
  isEmailNoUniqueValidate,
  IsLoginNoUniqueValidate,
} from './pipes/customValidator';
dotenv.config();

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          uri: configService.get<string>('MONGO_URI_CLUSTER'),
        };
      },
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserConfirmationInfo.name, schema: UserConfirmationInfoSchema },
      {
        name: UserRecoveryPasswordInfo.name,
        schema: UserRecoveryPasswordInfoSchema,
      },
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: ExtendedLikesInfo.name, schema: ExtendedLikesInfoSchema },
      { name: NewestLikes.name, schema: NewestLikesSchema },
      { name: Device.name, schema: DeviceSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: CommentatorInfo.name, schema: CommentatorInfoSchema },
      { name: LikesInfo.name, schema: LikesInfoSchema },
      { name: Reaction.name, schema: ReactionSchema },
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      //signOptions: { expiresIn: '60s' },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          service: 'gmail',
          //secure: false,
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASSWORD'),
          },
        },
        defaults: {
          from: '"No Reply" <noreply@example.com>',
        },
        template: {
          dir: join(__dirname, 'templates'),
          adapter: new HandlebarsAdapter(), // or new PugAdapter() or new EjsAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const ttl: number = parseInt(config.get('THROTTLE_TTL') as string, 10);
        const limit: number = parseInt(
          config.get('THROTTLE_LIMIT') as string,
          10,
        );
        return { ttl: ttl, limit: limit };
      },
    }),
  ],
  controllers: [
    UserController,
    DeleteBase,
    BlogController,
    PostController,
    AuthController,
    CommentController,
    SecurityController,
  ],
  providers: [
    UserService,
    UserRepository,
    BlogService,
    BlogRepository,
    PostService,
    PostRepository,
    LocalStrategy,
    AuthService,
    JwtStrategy,
    EmailAdapters,
    DeviceService,
    DeviceRepository,
    CommentService,
    CommentRepository,
    ReactionRepository,
    JwtServices,
    isEmailNoUniqueValidate,
    IsLoginNoUniqueValidate,
    // {
    //   provide: APP_GUARD,
    //   useClass: ThrottlerGuard,
    // },
  ],
})
export class AppModule {}
//     implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//         .apply(PaginationMiddleware )
//         .forRoutes({path: 'users', method: RequestMethod.GET });
//   }
// }
