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
  UserRecoveryPasswordInfo,
  UserRecoveryPasswordInfoSchema,
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
  IsBlogCheckingValidate,
  isEmailNoUniqueValidate,
  IsLoginNoUniqueValidate,
} from './pipes/customValidator';
import { CqrsModule } from '@nestjs/cqrs';
import { GetBlogsUseCase } from './Blog/use-cases/get-blogs-use-case';
import { CreateBlogUseCase } from './Blog/use-cases/create-blog-use-case';
import { UpdateBlogUseCase } from './Blog/use-cases/update-blog-use-case';
import { DeleteBlogUseCase } from './Blog/use-cases/delete-blog-use-case';
import { GetPostByBlog } from './Blog/use-cases/get-post-by-blog';
import { CreatePostByBlog } from './Blog/use-cases/create-post-by-blog';
import { GetPostByBlogForUser } from './Blog/use-cases/get-post-by-blog-for-user';
import { GetPostsUseCase } from './Post/use-cases/get-posts-use-case';
import { GetPostsForUserUseCase } from './Post/use-cases/get-posts-for-user-use-case';
import { GetPostForUserUseCase } from './Post/use-cases/get-post-for-user-use-case';
import { UpdateLikeStatusPostUseCase } from './Post/use-cases/update-like-status-post-use-case';
import { UpdatePostUseCase } from './Post/use-cases/update-post-use-case';
import { DeletePostUseCase } from './Post/use-cases/delete-post-use-case';
import { GetCommentForUserUseCase } from './Comment/use-cases/get-comment-for-user-use-case';
import { UpdateCommentUseCase } from './Comment/use-cases/update-comment-use-case';
import { CreateCommentForPostUseCase } from './Post/use-cases/create-comment-for-post-use-case';
import { GetCommentViewModelUseCase } from './Comment/use-cases/get-comment-view-model-use-case';
import { DeleteCommentUseCase } from './Comment/use-cases/delete-comment-use-case';
import { UpdateLikeStatusCommentUseCase } from './Comment/use-cases/update-like-status-comment-use-case';
import { GetCommentsForPostUseCase } from './Post/use-cases/get-comments-for-post-use-case';
import { GetCommentsForPostForUserUseCase } from './Post/use-cases/get-comments-for-post-for-user-use-case';
import { CreateDeviceUseCase } from './Device/use-case/create-device-use-case';
import { UpdateDeviceUseCase } from './Device/use-case/update-device-use-case';
import { GetDevicesUseCase } from './Device/use-case/get-devices-use-case';
import { DeleteDevicesUseCase } from './Device/use-case/delete-devices-use-case';
import { GetTokenByNameAndTitle } from './Device/use-case/get-token-by-name-and-title';
import { CheckActiveDeviceUseCase } from './Device/use-case/check-active-device-use-case';
import { RefreshTokenUseCase } from './Device/use-case/refresh-token-use-case';
import { SendEmailForRegistrationUserUseCase } from './adapters/email-adapters/use-case/send-email-for-registration-user-use-case';
import { SendEmailForPasswordRecoveryUseCase } from './adapters/email-adapters/use-case/send-email-for-password-recovery-use-case';
import { CreateUserAdminUseCase } from './User/use-cases/create-user-admin-use-case';
import { GetUsersUseCase } from './User/use-cases/get-users-use-case';
import { DeleteUserUseCase } from './User/use-cases/delete-user-use-case';
import { GetUserByLoginOrEmailUseCase } from './User/use-cases/get-user-by-login-or-email-use-case';
import { GetConfirmationCodeForUser } from './User/use-cases/get-confirmation-code-for-user';
import { CreateNewUserForRegistrationUseCase } from './User/use-cases/create-new-user-for-registration-use-case';
import { GetUserInformationUseCase } from './User/use-cases/get-user-information-use-case';
import { UpdatePasswordUserUseCase } from './User/use-cases/update-password-user-use-case';
import { UpdateConfirmationCodeForUser } from './User/use-cases/update-confirmation-code-for-user';
import { CheckDuplicateLoginAndEmailUseCase } from './User/use-cases/check-duplicate-login-and-email-use-case';
import { GetDeviceUseCase } from './Device/use-case/get-device-use-case';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from './User/User.Entity';
import { BlogEntity } from './Blog/Blog.Entity';
import { CommentEntity } from './Comment/Comment.Entity';
import { ReactionEntity } from './Like/Reaction.Entity';
import { DeviceEntity } from './Device/Device.Entity';
import { PostEntity } from './Post/Post.Entity';
import { UsersRepositorySql } from './User/users-repository-sql';
import { BlogsRepositorySql } from './Blog/blogs-repository-sql';
import { PostRepositorySql } from './Post/posts-repository-sql';
import { ReactionRepositorySql } from './Like/reaction-repository-sql';
import { DevicesRepositorySql } from './Device/devices-repository-sql';
import { CommentsRepositorySql } from './Comment/comments-repository-sql';
import { DataRepository } from './dataRepository';
import { DataRepositorySql } from './dataRepositorySql';
import {
  adminBlogsController,
  adminUserController,
} from './Admin/adminController';
import { UsersRepositoryTypeORM } from './User/usersRepositoryTypeORM';
import { UserConfirmationInfoEntity } from './User/UserConfirmationInfo.Entity';
import { UserRecoveryPasswordInfoEntity } from './User/UserRecoveryPasswordInfo.Entity';
import { BlogsRepositoryTypeORM } from './Blog/blogsRepositoryTypeORM';
import { PostsRepositoryTypeORM } from './Post/postsRepositoryTypeORM';

dotenv.config();
const useCaseUser = [
  CreateUserAdminUseCase,
  CreateNewUserForRegistrationUseCase,
  GetUsersUseCase,
  DeleteUserUseCase,
  GetUserByLoginOrEmailUseCase,
  GetConfirmationCodeForUser,
  GetUserInformationUseCase,
  UpdatePasswordUserUseCase,
  UpdateConfirmationCodeForUser,
  CheckDuplicateLoginAndEmailUseCase,
];
const useCaseBlog = [
  GetBlogsUseCase,
  CreateBlogUseCase,
  UpdateBlogUseCase,
  DeleteBlogUseCase,
  GetPostByBlog,
  CreatePostByBlog,
  GetPostByBlogForUser,
  DeleteCommentUseCase,
];
const useCasePost = [
  GetPostsUseCase,
  GetPostsForUserUseCase,
  GetPostForUserUseCase,
  UpdatePostUseCase,
  DeletePostUseCase,
  UpdateLikeStatusPostUseCase,
  CreateCommentForPostUseCase,
  GetCommentViewModelUseCase,
  GetCommentsForPostUseCase,
  GetCommentsForPostForUserUseCase,
];
const useCaseComment = [
  GetCommentForUserUseCase,
  UpdateCommentUseCase,
  UpdateLikeStatusCommentUseCase,
];
const useCaseDevice = [
  CreateDeviceUseCase,
  GetDeviceUseCase,
  GetDevicesUseCase,
  UpdateDeviceUseCase,
  DeleteDevicesUseCase,
  GetTokenByNameAndTitle,
  CheckActiveDeviceUseCase,
  RefreshTokenUseCase,
];
const useCaseAdapters = [
  SendEmailForRegistrationUserUseCase,
  SendEmailForPasswordRecoveryUseCase,
];
const sqlEntity = [
  UserEntity,
  UserConfirmationInfoEntity,
  UserRecoveryPasswordInfoEntity,
  BlogEntity,
  PostEntity,
  DeviceEntity,
  CommentEntity,
  ReactionEntity,
];
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
    CqrsModule,
    // TypeOrmModule.forRoot({
    //   type: 'postgres',
    //   host: 'localhost',
    //   port: 5432,
    //   username: 'user',
    //   password: 'admin',
    //   database: 'baseSql',
    //   entities: sqlEntity,
    //   autoLoadEntities: true,
    //   synchronize: true,
    // }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => {
        return {
          type: 'postgres',
          url: config.get('SQL_URL') as string,
          synchronize: true,
          autoLoadEntities: true,
          ssl: true,
        } as TypeOrmModuleOptions;
      },
    }),
    TypeOrmModule.forFeature(sqlEntity),
  ],
  controllers: [
    UserController,
    DeleteBase,
    BlogController,
    PostController,
    AuthController,
    CommentController,
    SecurityController,
    adminUserController,
    adminBlogsController,
  ],
  providers: [
    {
      provide: UserRepository,
      useClass:
        process.env.DATA_BASE === 'SQL'
          ? /*UsersRepositorySql*/ UsersRepositoryTypeORM
          : UserRepository,
    },
    {
      provide: BlogRepository,
      useClass:
        process.env.DATA_BASE === 'SQL'
          ? BlogsRepositoryTypeORM /*BlogsRepositorySql*/
          : BlogRepository,
    },
    {
      provide: PostRepository,
      useClass:
        process.env.DATA_BASE === 'SQL'
          ? /*PostRepositorySql*/ PostsRepositoryTypeORM
          : PostRepository,
    },
    {
      provide: ReactionRepository,
      useClass:
        process.env.DATA_BASE === 'SQL'
          ? ReactionRepositorySql
          : ReactionRepository,
    },
    {
      provide: DeviceRepository,
      useClass:
        process.env.DATA_BASE === 'SQL'
          ? DevicesRepositorySql
          : DeviceRepository,
    },
    {
      provide: CommentRepository,
      useClass:
        process.env.DATA_BASE === 'SQL'
          ? CommentsRepositorySql
          : DeviceRepository,
    },
    {
      provide: DataRepository,
      useClass:
        process.env.DATA_BASE === 'SQL' ? DataRepositorySql : DataRepository,
    },
    UserService,
    //UserRepository,
    BlogService,
    //BlogRepository,
    PostService,
    //PostRepository,
    LocalStrategy,
    AuthService,
    JwtStrategy,
    DeviceService,
    //DeviceRepository,
    CommentService,
    //CommentRepository,
    //ReactionRepository,
    JwtServices,
    isEmailNoUniqueValidate,
    IsLoginNoUniqueValidate,
    IsBlogCheckingValidate,
    ...useCaseBlog,
    ...useCasePost,
    ...useCaseComment,
    ...useCaseDevice,
    ...useCaseAdapters,
    ...useCaseUser,
    ...sqlEntity,
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
