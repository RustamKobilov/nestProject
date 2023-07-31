import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './User';
import { FilterQuery, Model, UpdateQuery, UpdateWriteOpResult } from 'mongoose';
import { CreateUserDto, outputModel, UserPaginationDTO } from '../DTO';
import { helper } from '../helper';
import { randomUUID } from 'crypto';

@Injectable()
export class UserRepository {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async checkDuplicateLoginAndEmail(createUserDto: CreateUserDto) {
    const searchLogin = {
      login: { $regex: createUserDto.login, $options: 'i' },
    };
    const searchEmail = {
      email: { $regex: createUserDto.email, $options: 'i' },
    };

    const userCount = await this.userModel.count({
      $or: [searchLogin, searchEmail],
    });

    if (userCount > 0) {
      throw new BadRequestException(`login and email dublicate`);
    }
    return;
  }

  async createUser(newUser: User) {
    const createUser = new this.userModel(newUser);
    await createUser.save();
    return;
  }

  async getUser(idUser: string): Promise<User> {
    const user = await this.userModel.findOne({ id: idUser });
    if (!user) {
      throw new NotFoundException(`If specified user is not exists`);
    }
    return user;
  }

  getFilterGetUsers(
    paginationUser: UserPaginationDTO,
  ): FilterQuery<UserDocument>[] {
    console.log(paginationUser);
    const searchLoginTerm =
      paginationUser.searchLoginTerm != null
        ? {
            login: { $regex: paginationUser.searchLoginTerm, $options: 'i' },
          }
        : {};
    const searchEmailTerm =
      paginationUser.searchEmailTerm != null
        ? {
            email: { $regex: paginationUser.searchEmailTerm, $options: 'i' },
          }
        : {};

    return [searchEmailTerm, searchLoginTerm];
  }

  async getUsers(
    paginationUser: UserPaginationDTO,
    filter: FilterQuery<UserDocument>[],
  ): Promise<outputModel<User>> {
    const totalCountUser = await this.userModel.count({ $or: filter });
    console.log(totalCountUser);
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationUser.pageNumber,
        paginationUser.pageSize,
        totalCountUser,
      );

    const sortUser = await this.userModel
      .find(
        { $or: filter },
        {
          _id: 0,
          __v: 0,
          hash: 0,
          salt: 0,
          password: 0,
          userConfirmationInfo: 0,
        },
      )
      .sort({ [paginationUser.sortBy]: paginationUser.sortDirection })
      .skip(paginationFromHelperForUsers.skipPage)
      .limit(paginationUser.pageSize)
      .lean();

    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationUser.pageNumber,
      pageSize: paginationUser.pageSize,
      totalCount: totalCountUser,
      items: sortUser,
    };
  }

  async deleteUser(userId: string) {
    await this.userModel.deleteOne({ id: userId });
    return;
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<User> {
    const user = await this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) {
      throw new BadRequestException('login and email not found');
    }
    return user;
  }
  async getCodeConfirmationByUserId(code: string): Promise<User> {
    const user = await this.userModel.findOne({
      'userConfirmationInfo.code': code,
    });
    if (!user) {
      throw new NotFoundException('usercode  not found');
    }
    return user;
  }
  async updateCodeConfirmationByUserId(userId: string) {
    const updateConfirmation: UpdateWriteOpResult =
      await this.userModel.updateOne(
        { id: userId },
        {
          'userConfirmationInfo.userConformation': true,
        },
      );
    //TODO как проверить обновление, нет свойства matchedCount
    return updateConfirmation.matchedCount === 1;
  }

  async deleteUserByConfirmationCode(userConfirmationCode: string) {
    await this.userModel.deleteOne({
      'userConfirmationInfo.code': userConfirmationCode,
    });
    return;
  }
}

//export class UserRepository implements OnModuleInit
// async onModuleInit() {
//   const res: UpdateWriteOpResult = await this.userModel.deleteOne(
//     { id: randomUUID() },
//   );
//   console.log(res.matchedCount);
// }
//TODO fast base
