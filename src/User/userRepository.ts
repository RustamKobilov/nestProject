import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './User';
import { FilterQuery, Model, UpdateWriteOpResult } from 'mongoose';
import { CreateUserDto, outputModel, UserPaginationDTO } from '../DTO';
import { helper } from '../helper';
import { mapObject } from '../mapObject';
import { UserViewModel } from '../viewModelDTO';

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
    console.log(userCount);
    if (userCount > 0) {
      return false;
    }
    return true;
  }

  async createUser(newUser: User) {
    const createUser = new this.userModel(newUser);
    await createUser.save();
    return;
  }

  async getUser(userId: string): Promise<User | null> {
    const user = await this.userModel.findOne({ id: userId });
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
  ): Promise<outputModel<UserViewModel>> {
    const totalCountUser = await this.userModel.count({ $or: filter });
    console.log(totalCountUser);
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationUser.pageNumber,
        paginationUser.pageSize,
        totalCountUser,
      );
    // const sortUser = await this.userModel
    //   .aggregate([
    //     { $math: { $or: filter } },
    //     { $sort: { [paginationUser.sortBy]: paginationUser.sortDirection } },
    //     { $skip: paginationFromHelperForUsers.skipPage },
    //     { $limit: paginationUser.pageSize },
    //   ])
    //   .exec()
    //   .catch((err) => {
    //     return err;
    //   });

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
      .lean()
      .exec();
    const resultUsers = await Promise.all(
      sortUser.map(async (user: User) => {
        const userView = await mapObject.mapUserForViewModel(user);
        return userView;
      }),
    );
    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationUser.pageNumber,
      pageSize: paginationUser.pageSize,
      totalCount: totalCountUser,
      items: resultUsers,
    };
  }

  async deleteUser(userId: string) {
    await this.userModel.deleteOne({ id: userId });
    return;
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<User | false> {
    const user = await this.userModel.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
    if (!user) {
      return false;
    }
    return user;
  }
  async getCodeConfirmationByUserId(code: string): Promise<User | false> {
    const user = await this.userModel.findOne({
      'userConfirmationInfo.code': code,
    });
    if (!user) {
      return false;
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
    return updateConfirmation.matchedCount === 1;
  }

  async deleteUserByConfirmationCode(userConfirmationCode: string) {
    await this.userModel.deleteOne({
      'userConfirmationInfo.code': userConfirmationCode,
    });
    return;
  }
  async findUserByEmail(email: string): Promise<User | false> {
    const user = await this.userModel.findOne({
      email: email,
    });
    if (!user) {
      return false;
    }
    return user;
  }
  async findUserByLogin(login: string): Promise<User | false> {
    const user = await this.userModel.findOne({
      login: login,
    });
    if (!user) {
      return false;
    }
    return user;
  }

  async findUserByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<User | false> {
    const user = await this.userModel.findOne({
      $or: [{ login: login }, { email: email }],
    });
    if (!user) {
      return false;
    }
    return user;
  }

  async recoveryPassword(
    userId: string,
    recoveryCode: string,
    diesAtDate: string,
  ) {
    const updateConfirmation: UpdateWriteOpResult =
      await this.userModel.updateOne(
        { id: userId },
        {
          'recoveryPasswordInfo.recoveryCode': recoveryCode,
          'recoveryPasswordInfo.diesAtDate': diesAtDate,
        },
      );
    return updateConfirmation.matchedCount === 1;
  }

  async updatePasswordUserByRecoveryCode(recoveryCode: string, hash: string) {
    const userPasswordUpdate: UpdateWriteOpResult =
      await this.userModel.updateOne(
        {
          'recoveryPasswordInfo.recoveryCode': recoveryCode,
          'recoveryPasswordInfo.diesAtDate': { $gte: new Date().toISOString() },
        },
        {
          password: hash,
        },
      );

    return userPasswordUpdate.matchedCount === 1;
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
