import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { User } from './User';
import { CreateUserDto, outputModel, UserPaginationDTO } from '../DTO';
import { mapObject } from '../mapObject';
import { UserViewModel } from '../viewModelDTO';
import { helper } from '../helper';

@Injectable()
export class UsersRepositorySql {
  constructor(@InjectDataSource() private dataSource: DataSource) {}
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
  //
  async createUser(newUser: User) {
    console.log(newUser);
    const queryInsertUserEntity = await this.dataSource.query(
      'INSERT INTO user_entity ("id", "login", "password", "email", "createdAt", "salt")' +
        ' VALUES ($1,$2, $3, $4, $5, $6)',
      [
        newUser.id,
        newUser.login,
        newUser.password,
        newUser.email,
        newUser.createdAt,
        newUser.salt,
      ],
    );
    const queryInsertUserConfirmationInfoEntity = await this.dataSource.query(
      'INSERT INTO user_confirmation_info_entity' +
        ' ("ownerId", "userConformation", code, "expirationCode")' +
        ' VALUES ($1,$2, $3, $4)',
      [
        newUser.id,
        newUser.userConfirmationInfo.userConformation,
        newUser.userConfirmationInfo.code,
        newUser.userConfirmationInfo.expirationCode,
      ],
    );
    const queryInsertUserRecoveryPasswordInfoEntity =
      await this.dataSource.query(
        'INSERT INTO user_recovery_password_info_entity' +
          ' ("ownerId", "recoveryCode", "diesAtDate")' +
          ' VALUES ($1,$2, $3)',
        [
          newUser.id,
          newUser.recoveryPasswordInfo.recoveryCode,
          newUser.recoveryPasswordInfo.diesAtDate,
        ],
      );
    return;
  }
  async deleteUser(userId: string) {
    //TODO как защитить от попадание подзапроса
    console.log(userId);
    const deleteUser = await this.dataSource.query(
      'DELETE FROM user_entity' + ' WHERE "id" = $1',
      [userId],
    );
    if (deleteUser[1] != 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return;
  }
  async getUser(userId: string): Promise<User | false> {
    const table = await this.dataSource.query(
      ' SELECT  "id", "login", "password", "email", "createdAt", "salt","recoveryCode", "diesAtDate","userConformation","code","expirationCode"' +
        'FROM user_entity' +
        '  join user_recovery_password_info_entity ' +
        '  on user_entity."id" = user_recovery_password_info_entity."ownerId"' +
        ' AND user_entity."id" = $1 ' +
        '  join user_confirmation_info_entity ' +
        '  on user_recovery_password_info_entity."ownerId" = user_confirmation_info_entity."ownerId"',
      [userId],
    );
    if (table.length < 1) {
      return false;
    }
    const user = mapObject.mapUsersFromSql(table);
    return user[0];
  }

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<User | false> {
    const table = await this.dataSource.query(
      'SELECT  "id", "login", "password", "email", "createdAt", "salt","recoveryCode", "diesAtDate","userConformation","code","expirationCode"' +
        ' FROM user_entity' +
        ' join user_recovery_password_info_entity' +
        ' on user_entity."id" = user_recovery_password_info_entity."ownerId"' +
        ' join user_confirmation_info_entity' +
        ' on user_recovery_password_info_entity."ownerId" = user_confirmation_info_entity."ownerId"' +
        ' WHERE user_entity."login" = $1 OR user_entity."email" =  $2',
      [loginOrEmail, loginOrEmail],
    );
    console.log(table);
    console.log('sql.loginAndEmail');
    if (table.length < 1) {
      return false;
    }
    const user = mapObject.mapUsersFromSql(table);
    return user[0];
  }

  async findUserByLogin(login: string): Promise<User | false> {
    const table = await this.dataSource.query(
      'SELECT  "id", "login", "password", "email", "createdAt", "salt","recoveryCode", "diesAtDate","userConformation","code","expirationCode"' +
        ' FROM user_entity' +
        ' join user_recovery_password_info_entity' +
        ' on user_entity."id" = user_recovery_password_info_entity."ownerId"' +
        ' AND user_entity."login" = $1' +
        ' join user_confirmation_info_entity' +
        ' on user_recovery_password_info_entity."ownerId" = user_confirmation_info_entity."ownerId"',
      [login],
    );
    console.log(table);
    console.log('sql.login');
    if (table.length < 1) {
      return false;
    }
    const user = mapObject.mapUsersFromSql(table);
    return user[0];
  }
  async findUserByEmail(email: string): Promise<User | false> {
    const table = await this.dataSource.query(
      'SELECT  "id", "login", "password", "email", "createdAt", "salt","recoveryCode", "diesAtDate","userConformation","code","expirationCode"' +
        ' FROM user_entity' +
        ' join user_recovery_password_info_entity' +
        ' on user_entity."id" = user_recovery_password_info_entity."ownerId"' +
        ' AND user_entity."email" = $1' +
        ' join user_confirmation_info_entity' +
        ' on user_recovery_password_info_entity."ownerId" = user_confirmation_info_entity."ownerId"',
      [email],
    );
    console.log(table);
    console.log('sql.email');
    if (table.length < 1) {
      return false;
    }
    const user = mapObject.mapUsersFromSql(table);
    return user[0];
  }
  async findUserByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<User | false> {
    const table = await this.dataSource.query(
      'SELECT  "id", "login", "password", "email", "createdAt", "salt","recoveryCode", "diesAtDate","userConformation","code","expirationCode"' +
        ' FROM user_entity' +
        ' join user_recovery_password_info_entity' +
        ' on user_entity."id" = user_recovery_password_info_entity."ownerId"' +
        ' join user_confirmation_info_entity' +
        ' on user_recovery_password_info_entity."ownerId" = user_confirmation_info_entity."ownerId"' +
        ' WHERE user_entity."login" = $1 OR user_entity."email" =  $2',
      [login, email],
    );
    console.log(table);
    console.log('sql.loginAndEmail');
    if (table.length < 1) {
      return false;
    }
    const user = mapObject.mapUsersFromSql(table);
    return user[0];
  }
  async getCodeConfirmationByUserId(code: string): Promise<User | false> {
    console.log(code);
    const name = 'persKerT';
    const upName = name.toLowerCase();
    console.log(upName);
    const table = await this.dataSource.query(
      'SELECT  "id", "login", "password", "email", "createdAt", "salt","recoveryCode", "diesAtDate","userConformation","code","expirationCode"' +
        ' FROM user_entity' +
        ' join user_recovery_password_info_entity' +
        ' on user_entity."id" = user_recovery_password_info_entity."ownerId"' +
        ' join user_confirmation_info_entity' +
        ' on user_recovery_password_info_entity."ownerId" = user_confirmation_info_entity."ownerId"' +
        ' AND user_confirmation_info_entity."code" = $1',
      [code],
    );
    console.log('get/code');
    console.log(table);
    if (table.length < 1) {
      return false;
    }
    const user = mapObject.mapUsersFromSql(table);
    console.log(user);
    return user[0];
  }
  async updateConfirmationUserId(userId: string) {
    const update = await this.dataSource.query(
      'UPDATE user_confirmation_info_entity' +
        ' SET "userConformation" = true' +
        ' WHERE "ownerId" = $1',
      [userId],
    );
    //TODO правильно ли проверять таким образом update
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async updateUserConformationCode(
    userId: string,
    newCode: string,
    expirationCode: string,
  ): Promise<boolean> {
    const update = await this.dataSource.query(
      'UPDATE user_confirmation_info_entity ' +
        ' SET "code" = $1,"expirationCode" = $2' +
        ' WHERE "ownerId" = $3',
      [newCode, expirationCode, userId],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async deleteUserByConfirmationCode(userConfirmationCode: string) {
    const selectUserId = await this.dataSource.query(
      'SELECT * FROM user_confirmation_info_entity' + ' WHERE "code" = $1',
      [userConfirmationCode],
    );
    const userId = selectUserId[0].ownerId;
    const deleteUser = await this.dataSource.query(
      'DELETE FROM user_entity' + ' WHERE "id" = $1',
      [userId],
    );
    console.log(deleteUser[1]);
    if (deleteUser[1] != 1) {
      throw new NotFoundException('0 item delete /userRepositorySql');
    }
    return;
  }
  async recoveryPassword(
    userId: string,
    recoveryCode: string,
    diesAtDate: string,
  ) {
    const update = await this.dataSource.query(
      'UPDATE user_recovery_password_info_entity ' +
        ' SET "recoveryCode" = $1,"diesAtDate" = $2' +
        ' WHERE "ownerId" = $3',
      [recoveryCode, diesAtDate, userId],
    );
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }
  async updatePasswordUserByRecoveryCode(recoveryCode: string, hash: string) {
    const update = await this.dataSource.query(
      'UPDATE user_entity ' +
        ' SET "password"= $1' +
        ' WHERE "id" = (SELECT "ownerId" FROM user_recovery_password_info_entity' +
        ' WHERE user_recovery_password_info_entity."recoveryCode" = $2' +
        ' AND user_recovery_password_info_entity."diesAtDate" >= $3)',
      [hash, recoveryCode, new Date().toISOString()],
    );
    console.log(new Date().toISOString() + ' date now');
    console.log('update down');
    console.log(update);
    return update[1] === 1;
  }

  getFilterGetUsers(paginationUser: UserPaginationDTO): string | null {
    console.log(paginationUser);
    if (
      paginationUser.searchLoginTerm != null &&
      paginationUser.searchEmailTerm != null
    ) {
      //paginationUser.searchLoginTerm
      const loginTerm = paginationUser.searchLoginTerm.toLowerCase();
      const emailTerm = paginationUser.searchEmailTerm.toLowerCase();
      return (
        '  WHERE LOWER("login")' +
        ' LIKE ' +
        "'%" +
        paginationUser.searchLoginTerm +
        "%'" +
        ' OR LOWER("login")' +
        ' Like ' +
        "'%" +
        paginationUser.searchEmailTerm +
        "%'"
      );
    }
    if (paginationUser.searchLoginTerm != null) {
      const loginTerm = paginationUser.searchLoginTerm.toLowerCase();
      return ' WHERE LOWER("login") LIKE ' + "'%" + loginTerm + "%'";
    }
    if (paginationUser.searchEmailTerm != null) {
      const emailTerm = paginationUser.searchEmailTerm.toLowerCase();
      return (
        ' WHERE LOWER("email") LIKE ' +
        "'%" +
        paginationUser.searchEmailTerm +
        "%'"
      );
    }
    return null;
  }

  async getUsers(
    paginationUser: UserPaginationDTO,
    filter: string | null,
  ): Promise<outputModel<UserViewModel>> {
    console.log('filter');
    console.log(filter);
    console.log('SQL getUsers');
    const filterCount =
      filter === null
        ? 'SELECT COUNT (*) FROM user_entity'
        : 'SELECT COUNT (*)  FROM user_entity ' + filter;
    const sortDirection = paginationUser.sortDirection === 1 ? 'ASC' : 'DESC';
    const queryCountUser = await this.dataSource.query(filterCount);
    console.log('filterCount');
    console.log(filterCount);
    const totalCountUser = parseInt(queryCountUser[0].count, 10);
    console.log(totalCountUser);
    const paginationFromHelperForUsers =
      helper.getPaginationFunctionSkipSortTotal(
        paginationUser.pageNumber,
        paginationUser.pageSize,
        totalCountUser,
      );
    console.log(paginationUser);
    const whereFilter = filter === null ? '' : filter;
    const zapros =
      'SELECT  "id", "login", "password", "email", "createdAt", "salt","recoveryCode", "diesAtDate","userConformation","code","expirationCode"' +
      ' FROM user_entity' +
      ' join user_recovery_password_info_entity' +
      ' on user_entity."id" = user_recovery_password_info_entity."ownerId"' +
      ' join user_confirmation_info_entity' +
      ' on user_recovery_password_info_entity."ownerId" = user_confirmation_info_entity."ownerId"' +
      whereFilter +
      ' ORDER BY' +
      ' "' +
      paginationUser.sortBy +
      '" ' +
      sortDirection +
      ' LIMIT ' +
      paginationUser.pageSize +
      ' OFFSET ' +
      paginationFromHelperForUsers.skipPage;
    console.log(zapros);
    const table = await this.dataSource.query(zapros);
    // const table = await this.dataSource.query<UserViewModel[]>(zapros);
    //console.log(table);
    const resultUsers = await Promise.all(
      table.map(async (user: User) => {
        const userView = await mapObject.mapUserForViewModel(user);
        return userView;
      }),
    );
    //console.log(resultUsers);
    return {
      pagesCount: paginationFromHelperForUsers.totalCount,
      page: paginationUser.pageNumber,
      pageSize: paginationUser.pageSize,
      totalCount: totalCountUser,
      items: resultUsers,
    };
  }
}
