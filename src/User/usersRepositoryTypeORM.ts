import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './User.Entity';
import { CreateUserDto, outputModel, UserPaginationDTO } from '../DTO';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { User } from './User';
import { UserConfirmationInfoEntity } from './UserConfirmationInfo.Entity';
import { UserRecoveryPasswordInfoEntity } from './UserRecoveryPasswordInfo.Entity';
import { mapObject } from '../mapObject';
import { UpdateWriteOpResult } from 'mongoose';
import { UserViewModel } from '../viewModelDTO';
import { helper } from '../helper';
import any = jasmine.any;

@Injectable()
export class UsersRepositoryTypeORM {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(UserConfirmationInfoEntity)
    private userConfirmationRepository: Repository<UserConfirmationInfoEntity>,
    @InjectRepository(UserRecoveryPasswordInfoEntity)
    private userRecoveryPasswordInfoRepository: Repository<UserRecoveryPasswordInfoEntity>,
    @InjectDataSource() private dataSource: DataSource,
  ) {}

  async checkDuplicateLoginAndEmail(createUserDto: CreateUserDto) {
    const query = await this.dataSource.query(
      'SELECT COUNT (*) FROM user_entity' +
        ' WHERE  "login" = $1 ' +
        ' OR "email" =  $2 ',
      [createUserDto.login, createUserDto.email],
    );
    const userCount = query[0].count;
    console.log(userCount);
    if (userCount > 0) {
      return false;
    }
    return true;
  }

  async createUser(newUser: User) {
    console.log(newUser);

    const user = await this.userRepository.save({
      id: newUser.id,
      login: newUser.login,
      email: newUser.email,
      createdAt: newUser.createdAt,
      salt: newUser.salt,
      password: newUser.password,
    });

    const userConfirmationInfo = await this.userConfirmationRepository.save({
      ownerId: newUser.id,
      userConformation: newUser.userConfirmationInfo.userConformation,
      code: newUser.userConfirmationInfo.code,
      expirationCode: newUser.userConfirmationInfo.expirationCode,
    });

    const userRecoveryPasswordInfo =
      await this.userRecoveryPasswordInfoRepository.save({
        ownerId: newUser.id,
        recoveryCode: newUser.recoveryPasswordInfo.recoveryCode,
        diesAtDate: newUser.recoveryPasswordInfo.diesAtDate,
      });

    return;
  }
  async deleteUser(userId: string) {
    const qbUser = await this.userRepository.createQueryBuilder('u');
    const deleteOperation = await qbUser
      .delete()
      .where('id = :id', { id: userId })
      .execute();
    if (deleteOperation.affected !== 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return;
  }
  async getUser(userId: string): Promise<User | false> {
    const qbUser = await this.userRepository.createQueryBuilder('u');

    const take = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where('id = :id', { id: userId })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }

    const sqlUsers = mapObject.mapRawManyQBOnTableName(take, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    const user = mapObject.mapUsersFromSql(sqlUsers);
    //console.log(user[0]);
    return user[0];
  }
  async getUserByLoginOrEmail(loginOrEmail: string): Promise<User | false> {
    const qbUser = await this.userRepository.createQueryBuilder('u');

    const take = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where('u.login = :login OR u.email = :login', {
        login: loginOrEmail,
        email: loginOrEmail,
      })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }

    const sqlUsers = mapObject.mapRawManyQBOnTableName(take, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    const user = mapObject.mapUsersFromSql(sqlUsers);
    //console.log(user[0]);
    return user[0];
  }

  async findUserByLogin(login: string): Promise<User | null> {
    const qbUser = await this.userRepository.createQueryBuilder('u');

    const take = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where('u.login = :login', {
        login: login,
      })
      .getRawMany();

    if (take.length < 1) {
      return null;
    }

    const sqlUsers = mapObject.mapRawManyQBOnTableName(take, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    const user = mapObject.mapUsersFromSql(sqlUsers);
    console.log('findUserByLogin');
    console.log(user[0]);
    return user[0];
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const qbUser = await this.userRepository.createQueryBuilder('u');

    const take = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where('u.email = :email', {
        email: email,
      })
      .getRawMany();

    if (take.length < 1) {
      return null;
    }

    const sqlUsers = mapObject.mapRawManyQBOnTableName(take, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    const user = mapObject.mapUsersFromSql(sqlUsers);
    console.log('findUserByEmail');
    console.log(user[0]);
    return user[0];
  }

  async findUserByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<User | null> {
    const qbUser = await this.userRepository.createQueryBuilder('u');

    const take = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where('u.login = :login OR u.email = :login', {
        login: login,
        email: email,
      })
      .getRawMany();

    if (take.length < 1) {
      return null;
    }

    const sqlUsers = mapObject.mapRawManyQBOnTableName(take, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    const user = mapObject.mapUsersFromSql(sqlUsers);
    //console.log(user[0]);
    return user[0];
  }
  async getCodeConfirmationByUserId(code: string): Promise<User | false> {
    const qbUser = await this.userRepository.createQueryBuilder('u');
    const take = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where('uCI.code = :code', {
        code: code,
      })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }

    const sqlUsers = mapObject.mapRawManyQBOnTableName(take, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    const user = mapObject.mapUsersFromSql(sqlUsers);
    //console.log(user[0]);
    return user[0];
  }
  async updateConfirmationUserId(userId: string): Promise<boolean> {
    const qbUserConfirmation =
      await this.userConfirmationRepository.createQueryBuilder('uCI');
    const update = await qbUserConfirmation
      .update(UserConfirmationInfoEntity)
      .set({ userConformation: true })
      .where('ownerId = :ownerId', { ownerId: userId })
      .execute();
    //TODO верно ли так проверять
    if (!update.affected) {
      return false;
    }
    return true;
  }
  async deleteUserByConfirmationCode(
    userConfirmationCode: string,
  ): Promise<boolean> {
    const qbUser = await this.userRepository.createQueryBuilder('u');
    const take = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where('uCI.code = :code', {
        code: userConfirmationCode,
      })
      .getRawMany();

    if (take.length < 1) {
      return false;
    }

    const sqlUsers = mapObject.mapRawManyQBOnTableName(take, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    //TODO каскадное удаление подходит или 3 удаления? пока удаление только юсера Тоже самое в обычном SQL.rep
    const user = mapObject.mapUsersFromSql(sqlUsers);
    const deleteOperation = await qbUser
      .delete()
      .where('id = :id', { id: user[0].id })
      .execute();
    if (deleteOperation.affected !== 1) {
      return false;
    }
    return true;
  }
  async recoveryPassword(
    userId: string,
    recoveryCode: string,
    diesAtDate: string,
  ) {
    const qbUserRecoveryPassword =
      await this.userRecoveryPasswordInfoRepository.createQueryBuilder('uRPI');
    const update = await qbUserRecoveryPassword
      .update(UserRecoveryPasswordInfoEntity)
      .set({ recoveryCode: recoveryCode, diesAtDate: diesAtDate })
      .where('ownerId = :ownerId', { ownerId: userId })
      .execute();
    //TODO верно ли так проверять
    if (!update.affected) {
      return false;
    }
    return true;
  }
  async updatePasswordUserByRecoveryCode(recoveryCode: string, hash: string) {
    const qbUserRecoveryPassword =
      await this.userRecoveryPasswordInfoRepository.createQueryBuilder('uRPI');
    const dateNow = '2023-11-14T13:40:43.272Z'; /*new Date().toISOString()*/
    const userIdSql = await qbUserRecoveryPassword
      .select('uRPI.ownerId')
      .where(
        'uRPI.recoveryCode = :recoveryCode AND uRPI.diesAtDate >= :diesAtDate',
        {
          recoveryCode: recoveryCode,
          diesAtDate: dateNow,
        },
      )
      .getRawMany();
    if (userIdSql.length < 1) {
      return false;
    }

    console.log(userIdSql);
    const ownerId = userIdSql.map((value) => {
      Object.keys(value).forEach((key) => {
        const newKey = key.replace('uRPI_', '');
        const valueKey = value[key];
        //console.log(newKey + ' newKey');
        delete value[key];
        value[newKey] = valueKey;
      });
      return value;
    })[0].ownerId;

    console.log('qpdatePasswords');
    console.log(ownerId);
    const qbUser = await this.userRepository.createQueryBuilder('u');
    const update = await qbUser
      .update(UserEntity)
      .set({ password: hash })
      .where('id = :ownerId', { ownerId: ownerId })
      .execute();

    if (!update.affected) {
      return false;
    }
    return true;
  }
  getFilterGetUsers(paginationUser: UserPaginationDTO): any | null {
    console.log(paginationUser);
    if (
      paginationUser.searchLoginTerm != null &&
      paginationUser.searchEmailTerm != null
    ) {
      const loginTerm = paginationUser.searchLoginTerm.toLowerCase();
      const emailTerm = paginationUser.searchEmailTerm.toLowerCase();
      return {
        where: 'u.login like :loginTerm OR u.email like :emailTerm',
        params: { loginTerm: `%${loginTerm}%`, emailTerm: `%${emailTerm}%` },
      };
      //params: {loginTerm: `%${loginTerm}%`, emailTerm: `%${emailTerm}%`}
      //return 'WHERE LOWER("login")' + ' LIKE ' + "'%" + loginTerm + "%'" + ' OR LOWER("email")' + ' Like ' + "'%" + emailTerm + "%'",
    }
    if (paginationUser.searchLoginTerm != null) {
      const loginTerm = paginationUser.searchLoginTerm.toLowerCase();
      return {
        where: 'u.login like :loginTerm',
        params: { loginTerm: `%${loginTerm}%` },
      };
      //return ' WHERE LOWER("login") LIKE ' + "'%" + loginTerm + "%'";
    }
    if (paginationUser.searchEmailTerm != null) {
      const emailTerm = paginationUser.searchEmailTerm.toLowerCase();
      return {
        where: 'u.email like :emailTerm',
        params: { emailTerm: `%${emailTerm}%` },
      };
      //return (' WHERE LOWER("email") LIKE ' +"'%" +paginationUser.searchEmailTerm +"%'");
    }
    return {
      where: '',
      params: '',
    };
  }
  async getUsers(
    paginationUser: UserPaginationDTO,
    filter: any | null,
  ): Promise<outputModel<UserViewModel>> {
    console.log('filter');
    console.log(filter);
    const qbUser = await this.userRepository.createQueryBuilder('u');
    const totalCountUser = await qbUser
      .where(filter.where, filter.params)
      .getCount();
    console.log(totalCountUser);
    const sortDirection = paginationUser.sortDirection === 1 ? 'ASC' : 'DESC';
    //console.log(totalCountUser);
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationUser.pageNumber,
        paginationUser.pageSize,
        totalCountUser,
      );
    const zaprosQb = await qbUser
      .leftJoinAndSelect('u.userConfirmationInfo', 'uCI')
      .leftJoinAndSelect('u.userRecoveryPasswordInfo', 'uRPI')
      .where(filter.where, filter.params)
      .orderBy('u.' + paginationUser.sortBy, sortDirection)
      .take(paginationUser.pageSize)
      .skip(paginationFromHelperForUsers.skipPage)
      .getRawMany();
    console.log('after');
    console.log(zaprosQb);

    const sqlUsers = mapObject.mapRawManyQBOnTableName(zaprosQb, [
      'u' + '_',
      'uCI' + '_',
      'uRPI' + '_',
    ]); //второй массив алиасы
    console.log('sqlUsers');
    console.log(sqlUsers);
    const users = mapObject.mapUsersFromSql(sqlUsers);
    const resultUsers = await Promise.all(
      users.map(async (user: User) => {
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
}
