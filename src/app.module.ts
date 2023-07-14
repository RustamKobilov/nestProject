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
import * as process from 'process';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth/auth.controller';
import { LocalStrategy } from './auth/Strategy/localStrategy';
import { AuthService } from './auth/auth.service';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        console.log(configService);
        console.log(configService.get<string>('MONGO_URI_CLUSTER'));
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
