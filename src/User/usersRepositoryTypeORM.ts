import { DataSource, Repository } from 'typeorm';
import { UserEntity } from './User.Entity';
import { CreateUserDto } from '../DTO';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { User } from './User';
import { UserConfirmationInfoEntity } from './UserConfirmationInfo.Entity';
import { UserRecoveryPasswordInfoEntity } from './UserRecoveryPasswordInfo.Entity';
import { mapObject } from '../mapObject';

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

  async getUserByLoginOrEmail(loginOrEmail: string): Promise<User | false> {
    //TODO find не страшно , а когда get  нужен встроенный запрос
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

  async findUserByLogin(login: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ login: login });
    console.log('findUserByLogin');
    console.log(user);
    return user;
  }

  async findUserByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy({ email: email });
    console.log('findUserByEmail');
    console.log(user);
    return user;
  }

  async findUserByLoginAndEmail(
    login: string,
    email: string,
  ): Promise<UserEntity | null> {
    const user = await this.userRepository.findOneBy([
      { email: email },
      { login: login },
    ]);
    console.log('findUserByLoginAndEmail');
    console.log(user);
    return user;
  }
  //userEntity заменить на User
}
