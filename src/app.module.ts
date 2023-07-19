import { Module } from '@nestjs/common';
import { UserController } from './User/userController';
import { UserService } from './User/userService';
import { UserRepository } from './User/userRepository';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import {
  User,
  UserConfirmationInfo,
  UserConfirmationInfoSchema,
  UserSchema,
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
      { name: Blog.name, schema: BlogSchema },
      { name: Post.name, schema: PostSchema },
      { name: ExtendedLikesInfo.name, schema: ExtendedLikesInfoSchema },
      { name: NewestLikes.name, schema: NewestLikesSchema },
    ]),
    PassportModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60s' },
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
  ],
  controllers: [
    UserController,
    DeleteBase,
    BlogController,
    PostController,
    AuthController,
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
    EmailAdapters,
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
